import React from 'react';
import { DocumentProvider } from '../contexts/DocumentContext';
import DocumentsPageComponent from '../components/documents/DocumentsPage';

const DocumentsPage: React.FC = () => {
  return (
    <DocumentProvider>
      <DocumentsPageComponent />
    </DocumentProvider>
  );
};

export default DocumentsPage;

