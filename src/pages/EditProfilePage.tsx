import React, { useState } from 'react';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

const QRDocxGenerator = () => {
  const [fileName, setFileName] = useState('document.docx');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodeBuffer = async (text) => {
    try {
      // Générer le QR code en Data URL
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
      });
      
      // Convertir le Data URL en Buffer
      const base64Data = dataUrl.split(',')[1];
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error('Erreur de génération du QR code:', error);
      throw error;
    }
  };

  const createAndSaveDoc = async () => {
    setIsGenerating(true);
    try {
      const qrBuffer = await generateQRCodeBuffer(fileName);
      
      // Créer le document avec le QR code
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: qrBuffer,
                  transformation: {
                    width: 50,
                    height: 50,
                  },
                  type: 'png',
                }),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du document');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        <div className="space-y-2">
          <label 
            htmlFor="fileName" 
            className="block text-sm font-medium text-gray-700"
          >
            Nom du document
          </label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le nom du document"
          />
        </div>
        
        <button
          onClick={createAndSaveDoc}
          disabled={isGenerating || !fileName.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Génération en cours...' : 'Générer le document'}
        </button>
      </div>
    </div>
  );
};

export default QRDocxGenerator;