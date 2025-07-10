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

// Prepare data for export
const prepareExportData = (members: CampaignListMember[]) => {
  return members.map((member) => ({
    'Influencer Name': member.social_account?.full_name || 'N/A',
    'Username': member.social_account?.account_handle || 'N/A',
    'Followers': member.social_account?.followers_count || 'N/A',
    'Follower Count (Numeric)': parseFollowerCount(member.social_account?.followers_count),
    'Verified': member.social_account?.is_verified ? 'Yes' : 'No'
  }));
};

// Export to Excel (XLSX) - Simplified version
export const exportToExcel = (members: CampaignListMember[], campaignName?: string) => {
  try {
    const exportData = prepareExportData(members);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet with data (headers will be automatically created from object keys)
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const columnWidths = [
      { wch: 25 },  // Influencer Name
      { wch: 20 },  // Username
      { wch: 15 },  // Followers
      { wch: 20 },  // Follower Count (Numeric)
      { wch: 10 }   // Verified
    ];
    ws['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    const sheetName = campaignName ? `${campaignName.substring(0, 20)} Influencers` : 'Shortlisted Influencers';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = campaignName 
      ? `${campaignName.replace(/[^a-zA-Z0-9]/g, '_')}_influencers_${timestamp}.xlsx`
      : `shortlisted_influencers_${timestamp}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    console.log('✅ Excel export completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

// Simplified export function - only Excel
export const exportInfluencers = async (
  members: CampaignListMember[], 
  campaignName?: string
) => {
  try {
    if (members.length === 0) {
      throw new Error('No influencers to export');
    }
    
    await exportToExcel(members, campaignName);
    return true;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
};