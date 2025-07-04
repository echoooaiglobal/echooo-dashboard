// src/components/ui/share-dialog.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Mail,
  QrCode,
} from 'lucide-react';
import { generateShareUrl, getPlatformShareUrls, type ShareReportOptions } from '@/lib/utils/shareUtils';

interface ShareDialogProps {
  children: React.ReactNode;
  platformAccountId: string;
  username?: string;
  displayName?: string;
  className?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  children,
  platformAccountId,
  username,
  displayName,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareOptions: ShareReportOptions = {
    platformAccountId,
    username,
    displayName
  };

  const shareUrl = generateShareUrl(shareOptions);
  const platformUrls = getPlatformShareUrls(shareOptions);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePlatformShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handlePreview = () => {
    window.open(shareUrl, '_blank');
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: platformUrls.twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: platformUrls.facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: platformUrls.linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: platformUrls.whatsapp,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Email',
      icon: Mail,
      url: platformUrls.email,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Profile Report
          </DialogTitle>
          <DialogDescription>
            Share this analytics report with others. The public link provides real-time data access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Copy Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Public Report URL</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePreview}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Anyone with this link can view the live analytics report
            </p>
          </div>

          {/* Social Media Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              {shareButtons.map((button) => (
                <Button
                  key={button.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformShare(button.url)}
                  className={`justify-start gap-2 ${button.color} text-white border-0`}
                >
                  <button.icon className="h-4 w-4" />
                  {button.name}
                </Button>
              ))}
            </div>
          </div>

          {/* QR Code Section (Optional) */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">QR Code</p>
                <p className="text-xs text-gray-500">
                  Generate QR code for easy mobile sharing
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('QR Code generation would be implemented here')}
              >
                <QrCode className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
          </Card>

          {/* Report Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Real-time Data</p>
                <p className="text-xs text-blue-700">
                  This shared report displays live analytics data that updates automatically. 
                  No authentication is required to view the report.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button onClick={handlePreview}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;