// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Format number for display
const formatNumber = (num: number | string): string => {
  if (!num) return '0';
  
  const numValue = typeof num === 'string' ? parseFloat(num.replace(/[^\d.]/g, '')) : num;
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  return numValue.toString();
};

// Parse follower count string to number
const parseFollowerCount = (followers: string | number | undefined): number => {
  if (!followers) return 0;
  
  if (typeof followers === 'number') return followers;
  
  const str = followers.toString().toLowerCase();
  const baseNumber = parseFloat(str.replace(/[km]/g, ''));
  
  if (str.includes('k')) {
    return baseNumber * 1000;
  } else if (str.includes('m')) {
    return baseNumber * 1000000;
  } else {
    return baseNumber || 0;
  }
};

// Column definition interface (matching the one from ShortlistedTable)
export interface ExportColumnDefinition {
  key: string;
  label: string;
  getValue: (member: CampaignListMember) => string | number | null;
  render?: (value: any, member: CampaignListMember) => React.ReactNode;
}

// Helper function to safely access additional metrics
const getAdditionalMetric = (member: CampaignListMember, key: string, defaultValue: any = null) => {
  const additionalMetrics = member?.social_account?.additional_metrics;
  if (!additionalMetrics || typeof additionalMetrics !== 'object') {
    return defaultValue;
  }
  
  // Type assertion to allow indexing
  const metricsObj = additionalMetrics as Record<string, any>;
  return metricsObj[key] ?? defaultValue;
};

// Helper function to parse JSON strings safely
const parseJSONSafely = (jsonString: any, defaultValue: any = null) => {
  if (!jsonString) return defaultValue;
  if (typeof jsonString === 'object') return jsonString;
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

// Helper function to get reel views from member data
const getReelViews = (member: CampaignListMember) => {
  // Check multiple possible locations for reel views data
  const instagramOptions = getAdditionalMetric(member, 'instagram_options');
  if (instagramOptions?.reel_views) {
    // If it's a range object with min/max
    if (typeof instagramOptions.reel_views === 'object' && 
        instagramOptions.reel_views.min !== undefined) {
      const avg = (instagramOptions.reel_views.min + instagramOptions.reel_views.max) / 2;
      return avg;
    }
    // If it's a direct number
    if (typeof instagramOptions.reel_views === 'number') {
      return instagramOptions.reel_views;
    }
  }
  
  // Check if it's stored in filter_match
  const filterMatch = getAdditionalMetric(member, 'filter_match');
  if (filterMatch?.instagram_options?.reel_views) {
    const reelViews = filterMatch.instagram_options.reel_views;
    if (typeof reelViews === 'number') {
      return reelViews;
    }
  }
  
  // Check for direct fields
  const averageReelViews = getAdditionalMetric(member, 'average_reel_views');
  if (averageReelViews !== null && averageReelViews !== undefined) {
    return averageReelViews;
  }
  
  const reelViews = getAdditionalMetric(member, 'reel_views');
  if (reelViews !== null && reelViews !== undefined) {
    return reelViews;
  }
  
  return null;
};

// Helper function to format location
const formatLocation = (member: CampaignListMember) => {
  const locationData = getAdditionalMetric(member, 'creator_location');
  const parsed = parseJSONSafely(locationData, null);
  
  if (parsed && parsed.city && parsed.country) {
    return `${parsed.city}, ${parsed.country}`;
  }
  
  const city = getAdditionalMetric(member, 'creator_city');
  const country = getAdditionalMetric(member, 'creator_country');
  
  if (city && country) {
    return `${city}, ${country}`;
  }
  
  return 'N/A';
};

// Helper function to get work platform info
const getWorkPlatform = (member: CampaignListMember) => {
  const platformData = getAdditionalMetric(member, 'work_platform');
  const parsed = parseJSONSafely(platformData, null);
  
  if (parsed && parsed.name) {
    return parsed;
  }
  
  // Fall back to individual platform fields
  const platformName = getAdditionalMetric(member, 'platform_name') || member.platform?.name;
  const platformLogo = getAdditionalMetric(member, 'platform_logo');
  const platformId = getAdditionalMetric(member, 'platform_id') || member.platform?.id;
  
  if (platformName) {
    return {
      name: platformName,
      logo_url: platformLogo,
      id: platformId
    };
  }
  
  return member.platform || null;
};

// Define all available columns (matching ShortlistedTable columns)
export const getAllExportColumns = (): ExportColumnDefinition[] => [
  {
    key: 'name',
    label: 'Name',
    getValue: (member) => member.social_account?.full_name || getAdditionalMetric(member, 'name') || ''
  },
  {
    key: 'followers',
    label: 'Followers',
    getValue: (member) => member.social_account?.followers_count || getAdditionalMetric(member, 'followers') || 0
  },
  {
    key: 'engagement_rate',
    label: 'Engagement Rate',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'engagementRate') || getAdditionalMetric(member, 'engagement_rate');
      if (typeof value === 'number') {
        return `${(value * 100).toFixed(2)}%`;
      }
      return 'N/A';
    }
  },
  {
    key: 'avg_likes',
    label: 'Average Likes',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'average_likes');
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'reel_views',
    label: 'Reel Views',
    getValue: (member) => {
      const value = getReelViews(member);
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'location',
    label: 'Location',
    getValue: (member) => formatLocation(member)
  },
  {
    key: 'gender',
    label: 'Gender',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'gender');
      if (!value) return 'N/A';
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
    }
  },
  {
    key: 'language',
    label: 'Language',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'language');
      return value ? String(value).toUpperCase() : 'N/A';
    }
  },
  {
    key: 'age_group',
    label: 'Age Group',
    getValue: (member) => getAdditionalMetric(member, 'age_group') || 'N/A'
  },
  {
    key: 'average_views',
    label: 'Average Views',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'average_views');
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'content_count',
    label: 'Content Count',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'content_count') || member.social_account?.media_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'subscriber_count',
    label: 'Subscribers',
    getValue: (member) => {
      const value = member.social_account?.subscribers_count || getAdditionalMetric(member, 'subscriber_count');
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'platform_account_type',
    label: 'Account Type',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'platform_account_type');
      if (!value) return 'N/A';
      return String(value).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  },
  {
    key: 'media_count',
    label: 'Media Count',
    getValue: (member) => {
      const value = member.social_account?.media_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'following_count',
    label: 'Following',
    getValue: (member) => {
      const value = member.social_account?.following_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    }
  },
  {
    key: 'livestream_metrics',
    label: 'Livestream',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'livestream_metrics');
      if (value && typeof value === 'object') {
        return 'Available';
      }
      return 'N/A';
    }
  },
  {
    key: 'verified',
    label: 'Verified',
    getValue: (member) => member.social_account?.is_verified ? 'Yes' : 'No'
  },
  {
    key: 'username',
    label: 'Username',
    getValue: (member) => member.social_account?.account_handle || getAdditionalMetric(member, 'username') || 'N/A'
  }
];

// Updated prepare data function that uses visible columns + static Profile URL + static Username
const prepareExportData = (members: CampaignListMember[], visibleColumnKeys: string[]) => {
  const allColumns = getAllExportColumns();
  const visibleColumns = allColumns.filter(col => visibleColumnKeys.includes(col.key));
  
  return members.map((member) => {
    const rowData: Record<string, any> = {};
    
    // Process visible columns and insert Username right after Name
    visibleColumns.forEach((column, index) => {
      rowData[column.label] = column.getValue(member);
      
      // If this is the Name column, immediately add Username after it
      if (column.key === 'name') {
        const username = member.social_account?.account_handle || getAdditionalMetric(member, 'username') || 'N/A';
        rowData['Username'] = username.startsWith('@') ? username : `@${username}`;
      }
    });
    
    // If Name column wasn't visible, add Username at the beginning
    if (!visibleColumnKeys.includes('name')) {
      const username = member.social_account?.account_handle || getAdditionalMetric(member, 'username') || 'N/A';
      const usernameValue = username.startsWith('@') ? username : `@${username}`;
      
      // Create new object with Username first, then existing data
      const newRowData = { 'Username': usernameValue, ...rowData };
      Object.keys(rowData).forEach(key => delete rowData[key]);
      Object.assign(rowData, newRowData);
    }
    
    // ALWAYS add the static "Profile URL" column at the end
    const profileUrl = member.social_account?.account_url || getAdditionalMetric(member, 'url') || 'N/A';
    rowData['Profile URL'] = profileUrl;
    
    return rowData;
  });
};

// Export to Excel (XLSX) - Updated to use dynamic columns
export const exportToExcel = (
  members: CampaignListMember[], 
  campaignName?: string,
  visibleColumnKeys?: string[]
) => {
  try {
    // If no visible columns specified, use default set (excluding the unwanted "Follower Count (Numeric)")
    const defaultColumns = ['name', 'username', 'followers', 'verified', 'engagement_rate', 'avg_likes', 'reel_views'];
    const columnsToExport = visibleColumnKeys || defaultColumns;
    
    const exportData = prepareExportData(members, columnsToExport);
    
    // Ensure we have data to export
    if (!exportData || exportData.length === 0) {
      throw new Error('No data to export');
    }
    
    console.log('📊 Export data prepared with columns:', Object.keys(exportData[0]));
    console.log('👤 Username column included:', Object.keys(exportData[0]).includes('Username'));
    console.log('🔗 Profile URL column included:', Object.keys(exportData[0]).includes('Profile URL'));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet with data (headers will be automatically created from object keys)
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set dynamic column widths based on number of columns (including Profile URL)
    const columnCount = Object.keys(exportData[0] || {}).length;
    const columnWidths = Array(columnCount).fill(0).map((_, index) => {
      // Adjust width based on column content
      const keys = Object.keys(exportData[0] || {});
      const key = keys[index];
      
      if (key && (key.includes('Name') || key.includes('Username'))) {
        return { wch: 25 };
      } else if (key && key.includes('Location')) {
        return { wch: 20 };
      } else if (key && key === 'Profile URL') {
        return { wch: 35 }; // Wider column for URLs
      } else {
        return { wch: 15 };
      }
    });
    ws['!cols'] = columnWidths;
    
    // Add worksheet to workbook with proper sheet name length handling
    let sheetName = 'Shortlisted Influencers'; // Default name
    
    if (campaignName) {
      // Create a safe sheet name that fits Excel's 31-character limit
      const maxLength = 31;
      const suffix = ' Influencers'; // 12 characters
      const availableLength = maxLength - suffix.length; // 19 characters for campaign name
      
      if (campaignName.length <= availableLength) {
        sheetName = `${campaignName}${suffix}`;
      } else {
        // Truncate campaign name to fit within limit
        const truncatedName = campaignName.substring(0, availableLength - 3) + '...';
        sheetName = `${truncatedName}${suffix}`;
      }
      
      // Ensure the final sheet name doesn't exceed 31 characters
      if (sheetName.length > maxLength) {
        sheetName = sheetName.substring(0, maxLength);
      }
    }
    
    console.log(`📋 Using sheet name: "${sheetName}" (${sheetName.length} chars)`);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate filename (can be longer than sheet name)
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `shortlisted_influencers_${timestamp}.xlsx`; // Default filename
    
    if (campaignName) {
      // Clean campaign name for filename (remove special characters)
      const cleanCampaignName = campaignName.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_');
      filename = `${cleanCampaignName}_influencers_${timestamp}.xlsx`;
    }
    
    console.log(`💾 Using filename: "${filename}"`);
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    console.log('✅ Excel export completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

// Updated main export function to accept visible columns
export const exportInfluencers = async (
  members: CampaignListMember[], 
  campaignName?: string,
  visibleColumnKeys?: string[]
) => {
  try {
    if (members.length === 0) {
      throw new Error('No influencers to export');
    }
    
    await exportToExcel(members, campaignName, visibleColumnKeys);
    return true;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
};