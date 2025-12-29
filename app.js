// motor-insurance-app.js - COMPLETE CLIENT-SIDE VERSION
class MobileInsuranceApp {
    constructor() {
        this.currentSection = 1;
        this.formData = {};
        this.calculatedValues = {};
        this.init();
    }

    init() {
        console.log('Mobile Insurance App Started');
        
        // Navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSection());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSection());
        
        // Action buttons - NO BACKEND CALLS
        document.getElementById('saveToExcelBtn').addEventListener('click', () => this.generateExcel());
        document.getElementById('downloadExcelBtn').addEventListener('click', () => this.downloadExcel());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        
        // Show first section
        this.showSection(1);
        
        // Load example data
        this.loadExampleData();
    }

    // === FORM DATA COLLECTION ===
    collectFormData() {
        this.formData = {
            // Section 1
            salutation: document.getElementById('salutation').value,
            insured_name: document.getElementById('insured_name').value,
            policy_type: document.getElementById('policy_type').value,
            vehicle_no: document.getElementById('vehicle_no').value,
            seating_capacity: document.getElementById('seating_capacity').value,
            vehicle_value: document.getElementById('vehicle_value').value,
            net_rate: document.getElementById('net_rate').value,
            
            // Section 2
            flood_cover: document.getElementById('flood_cover').checked ? 'Yes' : 'No',
            srcc_cover: document.getElementById('srcc_cover').checked ? 'Yes' : 'No',
            tc_cover: document.getElementById('tc_cover').checked ? 'Yes' : 'No',
            exclusion_cover: document.getElementById('exclusion_cover').checked ? 'Yes' : 'No',
            airbag_cover: document.getElementById('airbag_cover').value || '0',
            windscreen_cover: document.getElementById('windscreen_cover').value || '0',
            towing_charges: document.getElementById('towing_charges').value || '0',
            third_party_damage: document.getElementById('third_party_damage').value || '1000000'
        };
        
        console.log('Form data collected:', this.formData);
        return this.formData;
    }

    // === EXCEL GENERATION (Client-Side) ===
    generateExcel() {
        this.collectFormData();
        
        // Calculate premium (simple client-side calculation)
        this.calculatePremium();
        
        // Create workbook using SheetJS
        const wb = XLSX.utils.book_new();
        
        // Create data for Excel sheet
        const excelData = [
            ["MOTOR INSURANCE QUOTATION", "", "", "", ""],
            ["QUOTATION DATE:", new Date().toLocaleDateString(), "", "QUOTE NO:", `MOB${Date.now().toString().slice(-6)}`],
            ["", "", "", "", ""],
            
            ["INSURED INFORMATION", "", "", "", ""],
            ["Title:", this.formData.salutation, "", "", ""],
            ["Name of Insured:", this.formData.insured_name, "", "", ""],
            ["Vehicle Type:", this.formData.policy_type, "", "", ""],
            ["Vehicle No:", this.formData.vehicle_no, "", "", ""],
            ["Seating Capacity:", this.formData.seating_capacity, "", "", ""],
            ["Vehicle Value:", `Rs. ${this.formatCurrency(this.formData.vehicle_value)}`, "", "", ""],
            ["Net Rate:", `${this.formData.net_rate}%`, "", "", ""],
            ["", "", "", "", ""],
            
            ["ADDITIONAL COVERS", "", "", "", ""],
            ["Flood & Natural Disasters:", this.formData.flood_cover, "", "", ""],
            ["SRCC (Strike, Riot):", this.formData.srcc_cover, "", "", ""],
            ["Terrorism Cover:", this.formData.tc_cover, "", "", ""],
            ["Exclusion Cover:", this.formData.exclusion_cover, "", "", ""],
            ["", "", "", "", ""],
            
            ["COVER AMOUNTS", "", "", "", ""],
            ["Air Bag Cover:", `Rs. ${this.formatCurrency(this.formData.airbag_cover)}`, "", "", ""],
            ["Windscreen Cover:", `Rs. ${this.formatCurrency(this.formData.windscreen_cover)}`, "", "", ""],
            ["Towing Charges:", `Rs. ${this.formatCurrency(this.formData.towing_charges)}`, "", "", ""],
            ["3rd Party Damage:", `Rs. ${this.formatCurrency(this.formData.third_party_damage)}`, "", "", ""],
            ["", "", "", "", ""],
            
            ["PREMIUM CALCULATION", "", "", "", ""],
            ["Net Premium:", `Rs. ${this.calculatedValues.net_premium || "0.00"}`, "", "", ""],
            ["SRCC:", `Rs. ${this.calculatedValues.srcc || "0.00"}`, "", "", ""],
            ["Terrorism Cover:", `Rs. ${this.calculatedValues.terrorism_cover || "0.00"}`, "", "", ""],
            ["Road Safety Fund:", `Rs. ${this.calculatedValues.road_safety || "0.00"}`, "", "", ""],
            ["Policy Fee:", `Rs. ${this.calculatedValues.policy_fee || "1,000.00"}`, "", "", ""],
            ["NBT:", `Rs. ${this.calculatedValues.nbt || "0.00"}`, "", "", ""],
            ["Stamp Fee:", `Rs. ${this.calculatedValues.stamp_fee || "0.00"}`, "", "", ""],
            ["VAT:", `Rs. ${this.calculatedValues.vat || "0.00"}`, "", "", ""],
            ["", "", "", "", ""],
            ["TOTAL PREMIUM:", `Rs. ${this.calculatedValues.total || "0.00"}`, "", "", ""]
        ];
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 25 },  // Column A width
            { wch: 25 },  // Column B width
            { wch: 10 },  // Column C width
            { wch: 10 },  // Column D width
            { wch: 10 }   // Column E width
        ];
        
        // Add to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Quotation");
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const filename = `Motor_Insurance_Quote_${timestamp}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        this.showNotification('✅ Excel file generated and downloaded!');
        this.updatePreview();
    }

    // === SIMPLE PREMIUM CALCULATION ===
    calculatePremium() {
        // Simple calculation for demo
        // In real app, use proper formulas
        const vehicleValue = parseFloat(this.formData.vehicle_value) || 0;
        const netRate = parseFloat(this.formData.net_rate) || 0.65;
        
        // Basic premium calculation (net_rate% of vehicle value)
        const netPremium = vehicleValue * (netRate / 100);
        
        this.calculatedValues = {
            net_premium: this.formatCurrency(netPremium),
            srcc: this.formatCurrency(netPremium * 0.02),  // 2% of net
            terrorism_cover: this.formatCurrency(netPremium * 0.015),  // 1.5%
            road_safety: this.formatCurrency(netPremium * 0.01),  // 1%
            policy_fee: "1,000.00",
            nbt: this.formatCurrency(netPremium * 0.025),  // 2.5%
            stamp_fee: "50.00",
            vat: this.formatCurrency(netPremium * 0.18),  // 18% VAT
            total: this.formatCurrency(
                netPremium + 
                (netPremium * 0.02) + 
                (netPremium * 0.015) + 
                (netPremium * 0.01) + 
                1000 + 
                (netPremium * 0.025) + 
                50 + 
                (netPremium * 0.18)
            )
        };
        
        console.log('Calculated premium:', this.calculatedValues);
    }

    // === PDF GENERATION (Client-Side) ===
    generatePDF() {
        this.collectFormData();
        this.calculatePremium();
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.setTextColor(30, 60, 114); // Dark blue
        doc.text("MOTOR INSURANCE QUOTATION", 105, 20, { align: 'center' });
        
        // Quotation Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Quote No: MOB${Date.now().toString().slice(-6)}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 30);
        
        // Line separator
        doc.setDrawColor(30, 60, 114);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Insured Information
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text("INSURED INFORMATION", 20, 45);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        
        let y = 55;
        const info = [
            `Insured: ${this.formData.salutation} ${this.formData.insured_name}`,
            `Vehicle: ${this.formData.policy_type}`,
            `Vehicle No: ${this.formData.vehicle_no}`,
            `Seating Capacity: ${this.formData.seating_capacity}`,
            `Vehicle Value: Rs. ${this.formatCurrency(this.formData.vehicle_value)}`,
            `Net Rate: ${this.formData.net_rate}%`
        ];
        
        info.forEach(line => {
            doc.text(line, 25, y);
            y += 7;
        });
        
        y += 5;
        
        // Premium Breakdown
        doc.setFont(undefined, 'bold');
        doc.text("PREMIUM BREAKDOWN", 20, y);
        y += 10;
        
        doc.setFont(undefined, 'normal');
        const premiums = [
            ["Net Premium:", this.calculatedValues.net_premium],
            ["SRCC:", this.calculatedValues.srcc],
            ["Terrorism Cover:", this.calculatedValues.terrorism_cover],
            ["Road Safety Fund:", this.calculatedValues.road_safety],
            ["Policy Fee:", this.calculatedValues.policy_fee],
            ["NBT:", this.calculatedValues.nbt],
            ["Stamp Fee:", this.calculatedValues.stamp_fee],
            ["VAT:", this.calculatedValues.vat]
        ];
        
        premiums.forEach(([label, value]) => {
            doc.text(label, 25, y);
            doc.text(`Rs. ${value}`, 150, y, { align: 'right' });
            y += 7;
        });
        
        // Total
        y += 5;
        doc.setDrawColor(0, 0, 0);
        doc.line(25, y, 185, y);
        y += 10;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text("TOTAL PREMIUM:", 25, y);
        doc.text(`Rs. ${this.calculatedValues.total}`, 150, y, { align: 'right' });
        
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("This is a computer generated quotation.", 105, 280, { align: 'center' });
        doc.text("Generated by Mobile Insurance App", 105, 285, { align: 'center' });
        
        // Save PDF
        const filename = `Insurance_Quote_${Date.now()}.pdf`;
        doc.save(filename);
        
        this.showNotification('✅ PDF generated and downloaded!');
    }

    // === HELPER FUNCTIONS ===
    formatCurrency(value) {
        const num = parseFloat(value) || 0;
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: #28a745; color: white; padding: 12px 24px;
            border-radius: 8px; z-index: 10000; font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // === UI FUNCTIONS (Keep your existing) ===
    showSection(sectionNumber) {
        // Your existing showSection function
    }

    nextSection() {
        if (this.currentSection < 3) {
            this.collectFormData();
            this.showSection(this.currentSection + 1);
            if (this.currentSection === 3) {
                this.calculatePremium();
                this.updatePreview();
            }
        }
    }

    prevSection() {
        // Your existing prevSection function
    }

    updatePreview() {
        // Update preview with calculated values
        const previewFields = {
            'preview_name': `${this.formData.salutation || ''} ${this.formData.insured_name || ''}`.trim(),
            'preview_vehicle': this.formData.policy_type || '-',
            'preview_vehicle_no': this.formData.vehicle_no || '-',
            'preview_sum_insured': `Rs. ${this.formatCurrency(this.formData.vehicle_value)}`,
            'preview_net_premium': `Rs. ${this.calculatedValues.net_premium || '0.00'}`,
            'preview_srcc': `Rs. ${this.calculatedValues.srcc || '0.00'}`,
            'preview_tc': `Rs. ${this.calculatedValues.terrorism_cover || '0.00'}`,
            'preview_road_safety': `Rs. ${this.calculatedValues.road_safety || '0.00'}`,
            'preview_total': `Rs. ${this.calculatedValues.total || '0.00'}`
        };
        
        Object.entries(previewFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    loadExampleData() {
        setTimeout(() => {
            document.getElementById('salutation').value = 'M/S';
            document.getElementById('insured_name').value = 'John Doe';
            document.getElementById('policy_type').value = 'Private Car';
            document.getElementById('vehicle_no').value = 'CAB-1234';
            document.getElementById('seating_capacity').value = '4';
            document.getElementById('vehicle_value').value = '1000000';
            document.getElementById('net_rate').value = '0.65';
        }, 500);
    }

    downloadExcel() {
        // Alias for generateExcel
        this.generateExcel();
    }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.insuranceApp = new MobileInsuranceApp();
});