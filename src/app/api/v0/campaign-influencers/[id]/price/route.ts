// src/app/api/v0/campaign-influencers/[id]/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignInfluencerPriceServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/v0/campaign-influencers/{id}/price
 * Update campaign influencer price and currency
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign influencer ID is required' 
        },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ API Route: Invalid JSON in request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    const { collaboration_price, currency = 'USD' } = body;

    // Validate price if provided
    if (collaboration_price !== null && collaboration_price !== undefined) {
      const price = parseFloat(collaboration_price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'collaboration_price must be a valid positive number or null' 
          },
          { status: 400 }
        );
      }
    }

    // Validate currency
    if (currency && typeof currency !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'currency must be a valid string' 
        },
        { status: 400 }
      );
    }

    // Get auth token
    const authToken = await extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    console.log(`🔄 API Route: Updating campaign influencer price ${id} to ${collaboration_price} ${currency}`);

    // Call server service
    const result = await updateCampaignInfluencerPriceServer(
      id,
      collaboration_price,
      currency,
      authToken
    );

    console.log('✅ API Route: Campaign influencer price updated successfully');

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('💥 API Route: Error updating campaign influencer price:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to update price';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}