import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

export const exportToJPG = async (element, filePrefix, studentId) => {
  if (!element) {
    toast.error('Unable to locate template container. Please try again.');
    return;
  }

  toast.info('Generating high-resolution JPG...');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imageData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = imageData;
      link.download = `${filePrefix}_${studentId || 'Cover'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('JPG downloaded successfully!');
    } else {
      window.open(imageData);
    }
  } catch (error) {
    console.error('JPG generation error:', error);
    toast.error('Failed to generate JPG. Please try again.');
  }
};
