"use client";

import React from 'react';

interface FilePreviewProps {
  fileUrl: string;
  fileType: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, fileType }) => {
  const renderPreview = () => {
    if (fileType.startsWith('image/')) {
      return <img src={fileUrl} alt="Preview" style={{ maxWidth: '100%' }} />;
    } else if (fileType === 'application/pdf') {
      return <embed src={fileUrl} type="application/pdf" width="100%" height="600px" />;
    } else {
      return <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download File</a>;
    }
  };

  return <div>{renderPreview()}</div>;
};

export default FilePreview;
