
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Package, Product } from './localStorage';
import { calculatePackageTotal } from './csvUtils';

export const exportPackagesToPDF = (packages: Package[], products: Product[]): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('OpenBar Pro - Service Packages', 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let yPosition = 50;
  
  packages.forEach((pkg, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Package header
    doc.setFontSize(16);
    doc.text(`${index + 1}. ${pkg.name}`, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Description: ${pkg.description}`, 20, yPosition);
    yPosition += 10;
    
    // Package items table
    const tableData = pkg.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return ['Unknown Product', 0, 0, 0];
      
      const price = item.customPrice ?? product.unitPrice;
      const subtotal = price * item.quantity;
      
      return [
        product.name,
        item.quantity,
        `$${price.toFixed(2)}`,
        `$${subtotal.toFixed(2)}`
      ];
    });
    
    autoTable(doc, {
      head: [['Product', 'Quantity', 'Unit Price', 'Subtotal']],
      body: tableData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    
    // Package total
    const total = calculatePackageTotal(pkg, products);
    doc.setFontSize(12);
    doc.text(`Package Total: $${total.toFixed(2)}`, 20, yPosition);
    yPosition += 20;
  });
  
  // Grand total
  const grandTotal = packages.reduce((sum, pkg) => sum + calculatePackageTotal(pkg, products), 0);
  doc.setFontSize(14);
  doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 20, yPosition);
  
  doc.save('openbar-packages.pdf');
};
