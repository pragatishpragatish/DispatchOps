import jsPDF from 'jspdf'
import { createClient } from '@/lib/supabase/client'

interface InvoiceData {
  provider: {
    id: string
    company_name: string
    contact_person?: string | null
    phone?: string | null
    whatsapp?: string | null
  }
  invoiceDate: string
  coordinationFee: number
  description: string
  invoiceNumber?: string // Optional: use existing invoice number when redownloading
}

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin
  let logoHeight = 0
  let logoAdded = false

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 12, isBold: boolean = false, align: 'left' | 'right' | 'center' = 'left') => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth)
      if (align === 'right') {
        lines.forEach((line: string) => {
          const lineWidth = doc.getTextWidth(line)
          doc.text(line, x - lineWidth, y)
          y += fontSize * 0.4
        })
        return y
      } else if (align === 'center') {
        lines.forEach((line: string) => {
          const lineWidth = doc.getTextWidth(line)
          doc.text(line, x - lineWidth / 2, y)
          y += fontSize * 0.4
        })
        return y
      } else {
        doc.text(lines, x, y)
        return y + (lines.length * fontSize * 0.4)
      }
    } else {
      if (align === 'right') {
        const textWidth = doc.getTextWidth(text)
        doc.text(text, x - textWidth, y)
      } else if (align === 'center') {
        const textWidth = doc.getTextWidth(text)
        doc.text(text, x - textWidth / 2, y)
      } else {
        doc.text(text, x, y)
      }
      return y + fontSize * 0.4
    }
  }

  // Load and add logo FIRST, before any other content
  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png'
  const logoBase64 = await loadImageAsBase64(logoUrl)
  
  if (logoBase64) {
    try {
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const logoWidth = 45
            logoHeight = (img.height / img.width) * logoWidth
            doc.addImage(logoBase64, 'PNG', margin, margin, logoWidth, logoHeight)
            logoAdded = true
            yPos = margin + logoHeight + 5
          } catch (error) {
            console.warn('Could not add logo:', error)
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = logoBase64
      })
    } catch (error) {
      console.warn('Logo processing error:', error)
    }
  }

  // Company Header - Position based on logo
  if (logoAdded) {
    // Logo is on the left, company name on the right
    const companyX = margin + 55
    const headerY = margin + 12
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 138) // Indigo color
    doc.text('APEX FREIGHT LINK', companyX, headerY)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Logistics & Freight Coordination Services', companyX, headerY + 5)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPos = Math.max(margin + logoHeight + 8, headerY + 12)
  } else {
    // No logo - center company name
    yPos = margin
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 138) // Indigo color
    const companyNameWidth = doc.getTextWidth('APEX FREIGHT LINK')
    doc.text('APEX FREIGHT LINK', (pageWidth - companyNameWidth) / 2, yPos)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    const taglineWidth = doc.getTextWidth('Logistics & Freight Coordination Services')
    doc.text('Logistics & Freight Coordination Services', (pageWidth - taglineWidth) / 2, yPos + 6)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPos += 15
  }

  // Divider line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 12

  // Invoice Title - Right aligned
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138) // Indigo color
  const invoiceTitleWidth = doc.getTextWidth('INVOICE')
  doc.text('INVOICE', pageWidth - margin - invoiceTitleWidth, yPos)
  doc.setTextColor(0, 0, 0) // Reset to black
  yPos += 12

  // Parse invoice date (used for both invoice number generation and display)
  const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date()
  
  // Use existing invoice number if provided, otherwise generate new one
  // Format: INV-YYYYMMDD-XXX
  let invoiceNumber: string
  if (data.invoiceNumber) {
    invoiceNumber = data.invoiceNumber
  } else {
    // Generate invoice number (format: INV-YYYYMMDD-XXX)
    const year = invoiceDate.getFullYear()
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0')
    const day = String(invoiceDate.getDate()).padStart(2, '0')
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    invoiceNumber = `INV-${year}${month}${day}-${randomSuffix}`
  }
  
  // Two column layout: Bill To (left) and Invoice Details (right)
  // Left column - Bill To
  const leftColX = margin
  const rightColX = pageWidth - margin - 70
  const colWidth = (pageWidth - margin * 2 - 20) / 2
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138)
  doc.text('Bill To:', leftColX, yPos)
  doc.setTextColor(0, 0, 0)
  yPos += 6
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(data.provider.company_name, leftColX, yPos)
  yPos += 6
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (data.provider.contact_person) {
    doc.text(`Contact: ${data.provider.contact_person}`, leftColX, yPos)
    yPos += 5
  }
  if (data.provider.phone) {
    doc.text(`Phone: ${data.provider.phone}`, leftColX, yPos)
    yPos += 5
  }
  
  // Right column - Invoice Details
  yPos = yPos - (data.provider.contact_person ? 11 : 6) - (data.provider.phone ? 5 : 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice Number:', rightColX, yPos)
  doc.setFont('helvetica', 'bold')
  doc.text(invoiceNumber, rightColX + 32, yPos)
  yPos += 6
  
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice Date:', rightColX, yPos)
  doc.setFont('helvetica', 'bold')
  const invoiceDateStr = invoiceDate.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  doc.text(invoiceDateStr, rightColX + 32, yPos)
  
  yPos += 15

  // Items Table Header with better styling
  doc.setFillColor(30, 58, 138) // Indigo background
  doc.setDrawColor(30, 58, 138)
  doc.rect(margin, yPos, contentWidth, 9, 'FD')
  yPos += 6
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255) // White text
  doc.text('Description', margin + 3, yPos)
  
  const amountHeaderText = 'Amount (INR)'
  const amountHeaderWidth = doc.getTextWidth(amountHeaderText)
  doc.text(amountHeaderText, pageWidth - margin - 3 - amountHeaderWidth, yPos)
  doc.setTextColor(0, 0, 0) // Reset to black
  yPos += 8

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 6

  // Invoice Item
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const descLines = doc.splitTextToSize(data.description, contentWidth - 60)
  doc.text(descLines, margin + 3, yPos)
  
  // Amount - Right aligned, properly formatted (no currency symbol issues)
  const amountValue = parseFloat(data.coordinationFee.toFixed(2)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  const amountText = 'INR ' + amountValue
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const amountWidth = doc.getTextWidth(amountText)
  doc.text(amountText, pageWidth - margin - 3 - amountWidth, yPos)
  yPos += Math.max(descLines.length * 4, 8)

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Totals Section - Right aligned with proper formatting
  // Use a fixed column width approach to prevent overlap
  const totalsLabelX = pageWidth - margin - 80  // Labels start here
  const totalsAmountX = pageWidth - margin - 3   // Amounts end here (right edge)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsLabelX, yPos)
  const subtotalValue = parseFloat(data.coordinationFee.toFixed(2)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  const subtotalText = 'INR ' + subtotalValue
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const subtotalTextWidth = doc.getTextWidth(subtotalText)
  doc.text(subtotalText, totalsAmountX - subtotalTextWidth, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Tax (GST):', totalsLabelX, yPos)
  doc.setFont('helvetica', 'bold')
  const taxText = 'INR 0.00'
  const taxTextWidth = doc.getTextWidth(taxText)
  doc.text(taxText, totalsAmountX - taxTextWidth, yPos)
  yPos += 6

  doc.setLineWidth(0.8)
  doc.setDrawColor(100, 100, 100)
  doc.line(totalsLabelX, yPos, pageWidth - margin, yPos)
  yPos += 7

  // Total Amount - with more spacing
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138) // Indigo for total
  const totalLabelText = 'Total Amount:'
  const totalLabelWidth = doc.getTextWidth(totalLabelText)
  // Position label further left to avoid overlap
  doc.text(totalLabelText, totalsLabelX - 5, yPos)
  
  const totalValue = parseFloat(data.coordinationFee.toFixed(2)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  const totalText = 'INR ' + totalValue
  doc.setFontSize(13)
  const totalTextWidth = doc.getTextWidth(totalText)
  // Ensure amount is well separated from label
  doc.text(totalText, totalsAmountX - totalTextWidth, yPos)
  doc.setTextColor(0, 0, 0) // Reset to black
  yPos += 18

  // Payment Terms Box - Professional styling
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(248, 250, 252) // Light gray-blue
  doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, 'FD')
  doc.setDrawColor(180, 180, 180)
  yPos += 5
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138)
  doc.text('Payment Terms:', margin + 4, yPos)
  doc.setTextColor(0, 0, 0)
  yPos += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const termsText = 'Payment due within 7 days of invoice date. Late payments may incur additional charges.'
  const termsLines = doc.splitTextToSize(termsText, contentWidth - 8)
  doc.text(termsLines, margin + 4, yPos)
  yPos += termsLines.length * 4 + 8

  // Footer Section
  const footerY = doc.internal.pageSize.getHeight() - 40
  doc.setLineWidth(0.5)
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, footerY, pageWidth - margin, footerY)
  
  yPos = footerY + 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Thank you for your business!', margin, yPos)
  yPos += 5
  doc.setFontSize(9)
  doc.text('For inquiries, please contact us.', margin, yPos)
  
  // Company details at bottom - centered with logo if available
  const companyDetailsY = footerY + 20
  if (logoAdded && logoHeight > 0) {
    // Add small logo in footer
    try {
      doc.addImage(logoBase64!, 'PNG', (pageWidth - 20) / 2, companyDetailsY - 3, 20, (logoHeight / logoWidth) * 20)
    } catch (e) {
      // Ignore footer logo errors
    }
  }
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 58, 138)
  const companyNameWidth = doc.getTextWidth('APEX FREIGHT LINK')
  doc.text('APEX FREIGHT LINK', (pageWidth - companyNameWidth) / 2, companyDetailsY + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  const taglineWidth = doc.getTextWidth('Logistics & Freight Coordination')
  doc.text('Logistics & Freight Coordination', (pageWidth - taglineWidth) / 2, companyDetailsY + 12)

  // Generate filename
  const filename = `Invoice_${data.provider.company_name.replace(/\s+/g, '_')}_${invoiceNumber}.pdf`
  
  // Save invoice to database only if it's a new invoice (no invoiceNumber provided)
  if (!data.invoiceNumber) {
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('invoices').insert([
        {
          provider_id: data.provider.id,
          invoice_number: invoiceNumber,
          invoice_date: data.invoiceDate,
          coordination_fee: data.coordinationFee,
          description: data.description,
          status: 'pending',
        },
      ])
      
      if (dbError) {
        console.warn('Could not save invoice to database:', dbError)
        // Continue with PDF generation even if DB save fails
      }
    } catch (error) {
      console.warn('Could not save invoice to database:', error)
      // Continue with PDF generation even if DB save fails
    }
  }
  
  // Save PDF
  doc.save(filename)
}
