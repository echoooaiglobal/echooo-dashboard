// src/app/api/v0/message-templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createMessageTemplateServer } from '@/services/message-templates/message-templates.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * POST /api/v0/message-templates
 * Create a new message template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.subject || !body.content || !body.company_id || !body.campaign_id) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, content, company_id, and campaign_id are required' },
        { status: 400 }
      );
    }

    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Call FastAPI backend through server-side service with auth token
    const template = await createMessageTemplateServer({
      subject: body.subject,
      content: body.content,
      company_id: body.company_id,
      campaign_id: body.campaign_id,
      is_global: body.is_global ?? true
    }, authToken);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create message template' },
      { status: 500 }
    );
  }
}