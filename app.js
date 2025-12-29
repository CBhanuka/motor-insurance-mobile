// Mobile Insurance Quotation App - Client Side Only
class MobileInsuranceApp {
    constructor() {
        this.currentSection = 1;
        this.formData = {};
        this.calculatedValues = {};
        this.init();
    }

    init() {
        console.log('🚗 Mobile Insurance App Started');
        
        // Show first section
        this.showSection(1);
        
        // Setup navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSection());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSection());
        
        // Setup action buttons
        document.getElementById('saveToExcelBtn').addEventListener('click', () => this.generateExcel());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        
        // Load example data
        setTimeout(() => this.loadExampleData(), 500);
        
        // Check if mobile
        this.checkMobile();
    }

    // Show/Hide Sections
    showSection(sectionNumber) {
        // Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(`section${sectionNumber}`).classList.add('active');
        
        // Update progress steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        for (let i = 1; i <= 3; i++) {
            const step = document.querySelector(`.step[data-step="${i}"]`);
            if (i < sectionNumber) {
                step.classList.add('completed');
            } else if (i === sectionNumber) {
                step.classList.add('active');
            }
        }
        
        // Update buttons
        document.getElementById('prevBtn').style.display = sectionNumber === 1 ? 'none' : 'flex';
        document.getElementById('nextBtn').style.display = sectionNumber === 3 ? 'none' : 'flex';
        
        this.currentSection = sectionNumber;
        
        // Update preview if on review section
        if (sectionNumber === 3) {
            this.collectFormData();
            this.calculatePremium();
            this.updatePreview();
        }
    }

    nextSection() {
        if (this.currentSection < 3) {
            this.collectFormData();
            this.showSection(this.currentSection + 1);
        }
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.showSection(this.currentSection - 1);
        }
    }

    // Collect Form Data
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
            airbag_cover: document.getElementById('airbag_cover').value,
            windscreen_cover: document.getElementById('windscreen_cover').value,
            towing_charges: document.getElementById('towing_charges').value,
            third_party_damage: document.getElementById('third_party_damage').value
        };
        
        console.log('📝 Form data collected:', this.formData);
        return this.formData;
    }

    // Calculate Premium
    calculatePremium() {
        const vehicleValue = parseFloat(this.formData.vehicle_value) || 0;
        const netRate = parseFloat(this.formData.net_rate) || 0.65;
        
        // Basic premium calculation
        const netPremium = vehicleValue * (netRate / 100);
        const srcc = netPremium * 0.02;      // 2%
        const terrorism = netPremium * 0.015; // 1.5%
        const roadSafety = netPremium * 0.01; // 1%
        const policyFee = 1000;
        const nbt = netPremium * 0.02564;    // 2.564%
        const stampFee = 50;
        const vat = (netPremium + srcc + terrorism + roadSafety + policyFee + nbt) * 0.18; // 18%
        
        const total = netPremium + srcc + terrorism + roadSafety + policyFee + nbt + stampFee + vat;
        
        this.calculatedValues = {
            net_premium: this.formatCurrency(netPremium),
            srcc: this.formatCurrency(srcc),
            terrorism_cover: this.formatCurrency(terrorism),
            road_safety: this.formatCurrency(roadSafety),
            policy_fee: this.formatCurrency(policyFee),
            nbt: this.formatCurrency(nbt),
            stamp_fee: this.formatCurrency(stampFee),
            vat: this.formatCurrency(vat),
            total: this.formatCurrency(total)
        };
        
        console.log('💰 Premium calculated:', this.calculatedValues);
    }

    // Generate Excel File
    generateExcel() {
        this.collectFormData();
        this.calculatePremium();
        
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Prepare data for Excel
            const excelData = [
                ["MOTOR INSURANCE QUOTATION", "", "", "", "", ""],
                ["", "", "", "", "", ""],
                ["QUOTATION DETAILS", "", "", "DATE:", new Date().toLocaleDateString(), ""],
                ["QUOTE NO:", `MOB${Date.now().toString().slice(-8)}`, "", "TIME:", new Date().toLocaleTimeString(), ""],
                ["", "", "", "", "", ""],
                ["INSURED INFORMATION", "", "", "", "", ""],
                ["Title:", this.formData.salutation, "", "", "", ""],
                ["Name:", this.formData.insured_name, "", "", "", ""],
                ["Vehicle Type:", this.formData.policy_type, "", "", "", ""],
                ["Vehicle No:", this.formData.vehicle_no, "", "", "", ""],
                ["Seating Capacity:", this.formData.seating_capacity, "", "", "", ""],
                ["Vehicle Value:", `Rs. ${this.formatCurrency(this.formData.vehicle_value)}`, "", "", "", ""],
                ["Net Rate:", `${this.formData.net_rate}%`, "", "", "", ""],
                ["", "", "", "", "", ""],
                ["ADDITIONAL COVERS", "", "", "", "", ""],
                ["Flood Cover:", this.formData.flood_cover, "", "", "", ""],
                ["SRCC Cover:", this.formData.srcc_cover, "", "", "", ""],
                ["Terrorism Cover:", this.formData.tc_cover, "", "", "", ""],
                ["", "", "", "", "", ""],
                ["COVER AMOUNTS", "", "", "", "", ""],
                ["Air Bag Cover:", `Rs. ${this.formatCurrency(this.formData.airbag_cover)}`, "", "", "", ""],
                ["Windscreen Cover:", `Rs. ${this.formatCurrency(this.formData.windscreen_cover)}`, "", "", "", ""],
                ["Towing Charges:", `Rs. ${this.formatCurrency(this.formData.towing_charges)}`, "", "", "", ""],
                ["3rd Party Damage:", `Rs. ${this.formatCurrency(this.formData.third_party_damage)}`, "", "", "", ""],
                ["", "", "", "", "", ""],
                ["PREMIUM BREAKDOWN", "", "", "", "", ""],
                ["Description", "Amount (Rs.)", "", "", "", ""],
                ["Net Premium", this.calculatedValues.net_premium, "", "", "", ""],
                ["SRCC", this.calculatedValues.srcc, "", "", "", ""],
                ["Terrorism Cover", this.calculatedValues.terrorism_cover, "", "", "", ""],
                ["Road Safety Fund", this.calculatedValues.road_safety, "", "", "", ""],
                ["Policy Fee", this.calculatedValues.policy_fee, "", "", "", ""],
                ["NBT", this.calculatedValues.nbt, "", "", "", ""],
                ["Stamp Fee", this.calculatedValues.stamp_fee, "", "", "", ""],
                ["VAT", this.calculatedValues.vat, "", "", "", ""],
                ["", "", "", "", "", ""],
                ["TOTAL PREMIUM", this.calculatedValues.total, "", "", "", ""]
            ];
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 25 }, { wch: 20 }, { wch: 5 }, 
                { wch: 15 }, { wch: 15 }, { wch: 5 }
            ];
            
            // Add to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Quotation");
            
            // Generate filename
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`;
            const filename = `Motor_Insurance_Quote_${timestamp}.xlsx`;
            
            // Download file
            XLSX.writeFile(wb, filename);
            
            this.showNotification('✅ Excel file downloaded successfully!');
            
        } catch (error) {
            console.error('Excel generation error:', error);
            this.showNotification('❌ Error generating Excel file');
        }
    }

    // Generate PDF File
    generatePDF() {
        this.collectFormData();
        this.calculatePremium();
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set document properties
            doc.setProperties({
                title: 'Motor Insurance Quotation',
                subject: 'Insurance Quote',
                author: 'Mobile Insurance App',
                keywords: 'insurance, motor, quotation',
                creator: 'Mobile Insurance App'
            });
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(30, 60, 114);
            doc.text("MOTOR INSURANCE QUOTATION", 105, 20, { align: 'center' });
            
            // Quotation Info
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const quoteId = `MOB${Date.now().toString().slice(-8)}`;
            doc.text(`Quotation No: ${quoteId}`, 20, 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 30);
            doc.text(`Time: ${new Date().toLocaleTimeString()}`, 160, 35);
            
            // Update display
            document.getElementById('quoteIdDisplay').textContent = quoteId;
            
            // Line separator
            doc.setDrawColor(30, 60, 114);
            doc.setLineWidth(0.5);
            doc.line(20, 40, 190, 40);
            
            // Insured Information Section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text("INSURED INFORMATION", 20, 50);
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(11);
            
            let y = 60;
            const insuredInfo = [
                `Name: ${this.formData.salutation} ${this.formData.insured_name}`,
                `Vehicle Type: ${this.formData.policy_type}`,
                `Vehicle Number: ${this.formData.vehicle_no}`,
                `Seating Capacity: ${this.formData.seating_capacity}`,
                `Vehicle Value: Rs. ${this.formatCurrency(this.formData.vehicle_value)}`,
                `Net Rate: ${this.formData.net_rate}%`
            ];
            
            insuredInfo.forEach(line => {
                doc.text(line, 25, y);
                y += 7;
            });
            
            y += 5;
            
            // Additional Covers
            doc.setFont(undefined, 'bold');
            doc.text("ADDITIONAL COVERS", 20, y);
            y += 10;
            
            doc.setFont(undefined, 'normal');
            const covers = [
                `Flood & Natural Disasters: ${this.formData.flood_cover}`,
                `SRCC (Strike, Riot): ${this.formData.srcc_cover}`,
                `Terrorism Cover: ${this.formData.tc_cover}`
            ];
            
            covers.forEach(line => {
                doc.text(line, 25, y);
                y += 7;
            });
            
            y += 5;
            
            // Cover Amounts
            doc.setFont(undefined, 'bold');
            doc.text("COVER AMOUNTS", 20, y);
            y += 10;
            
            doc.setFont(undefined, 'normal');
            const coverAmounts = [
                `Air Bag Cover: Rs. ${this.formatCurrency(this.formData.airbag_cover)}`,
                `Windscreen Cover: Rs. ${this.formatCurrency(this.formData.windscreen_cover)}`,
                `Towing Charges: Rs. ${this.formatCurrency(this.formData.towing_charges)}`,
                `3rd Party Damage: Rs. ${this.formatCurrency(this.formData.third_party_damage)}`
            ];
            
            coverAmounts.forEach(line => {
                doc.text(line, 25, y);
                y += 7;
            });
            
            y += 10;
            
            // Premium Breakdown Table
            doc.setFont(undefined, 'bold');
            doc.text("PREMIUM BREAKDOWN", 20, y);
            y += 10;
            
            // Table header
            doc.setFillColor(30, 60, 114);
            doc.setTextColor(255, 255, 255);
            doc.rect(20, y, 170, 8, 'F');
            doc.text("Description", 25, y + 6);
            doc.text("Amount (Rs.)", 160, y + 6, { align: 'right' });
            
            y += 8;
            doc.setTextColor(0, 0, 0);
            
            // Table rows
            const premiumRows = [
                ["Net Premium", this.calculatedValues.net_premium],
                ["SRCC", this.calculatedValues.srcc],
                ["Terrorism Cover", this.calculatedValues.terrorism_cover],
                ["Road Safety Fund", this.calculatedValues.road_safety],
                ["Policy Fee", this.calculatedValues.policy_fee],
                ["NBT", this.calculatedValues.nbt],
                ["Stamp Fee", this.calculatedValues.stamp_fee],
                ["VAT", this.calculatedValues.vat]
            ];
            
            let rowNum = 0;
            premiumRows.forEach(([description, amount]) => {
                if (rowNum % 2 === 0) {
                    doc.setFillColor(240, 248, 255);
                    doc.rect(20, y, 170, 8, 'F');
                }
                
                doc.text(description, 25, y + 6);
                doc.text(amount, 160, y + 6, { align: 'right' });
                y += 8;
                rowNum++;
            });
            
            // Total row
            y += 5;
            doc.setDrawColor(0, 0, 0);
            doc.line(20, y, 190, y);
            y += 10;
            
            doc.setFont(undefined, 'bold');
            doc.setFontSize(12);
            doc.text("TOTAL PREMIUM", 25, y);
            doc.text(`Rs. ${this.calculatedValues.total}`, 160, y, { align: 'right' });
            
            // Footer
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("This is a computer generated quotation.", 105, 280, { align: 'center' });
            doc.text("For official use only.", 105, 285, { align: 'center' });
            
            // Save PDF
            const filename = `Insurance_Quote_${quoteId}.pdf`;
            doc.save(filename);
            
            this.showNotification('✅ PDF downloaded successfully!');
            
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showNotification('❌ Error generating PDF');
        }
    }

    // Update Preview
    updatePreview() {
        document.getElementById('preview_name').textContent = 
            `${this.formData.salutation || ''} ${this.formData.insured_name || ''}`.trim() || '-';
        document.getElementById('preview_vehicle').textContent = this.formData.policy_type || '-';
        document.getElementById('preview_vehicle_no').textContent = this.formData.vehicle_no || '-';
        document.getElementById('preview_sum_insured').textContent = 
            `Rs. ${this.formatCurrency(this.formData.vehicle_value)}`;
        
        document.getElementById('preview_net_premium').textContent = 
            `Rs. ${this.calculatedValues.net_premium || '0.00'}`;
        document.getElementById('preview_srcc').textContent = 
            `Rs. ${this.calculatedValues.srcc || '0.00'}`;
        document.getElementById('preview_tc').textContent = 
            `Rs. ${this.calculatedValues.terrorism_cover || '0.00'}`;
        document.getElementById('preview_total').textContent = 
            `Rs. ${this.calculatedValues.total || '0.00'}`;
    }

    // Helper Functions
    formatCurrency(value) {
        const num = parseFloat(value) || 0;
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    showNotification(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    loadExampleData() {
        document.getElementById('salutation').value = 'M/S';
        document.getElementById('insured_name').value = 'John Doe';
        document.getElementById('policy_type').value = 'Private Car';
        document.getElementById('vehicle_no').value = 'CAB-1234';
        document.getElementById('seating_capacity').value = '4';
        document.getElementById('vehicle_value').value = '1000000';
        document.getElementById('net_rate').value = '0.65';
        
        document.getElementById('flood_cover').checked = true;
        document.getElementById('srcc_cover').checked = true;
        
        this.collectFormData();
        this.calculatePremium();
        this.updatePreview();
    }

    checkMobile() {
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            console.log('📱 Mobile device detected');
            
            // Show install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                
                // Show install button after 5 seconds
                setTimeout(() => {
                    this.showInstallPrompt();
                }, 5000);
            });
        }
    }

    showInstallPrompt() {
        if (!window.deferredPrompt) return;
        
        const installBtn = document.createElement('button');
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.cssText = `
            position: fixed; bottom: 80px; right: 20px; z-index: 1000;
            padding: 12px 20px; background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
            color: white; border: none; border-radius: 25px; font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;
        `;
        
        installBtn.onclick = async () => {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                const { outcome } = await window.deferredPrompt.userChoice;
                console.log(`User ${outcome} the install`);
                window.deferredPrompt = null;
                installBtn.remove();
            }
        };
        
        document.body.appendChild(installBtn);
        
        // Remove button after 30 seconds
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.remove();
            }
        }, 30000);
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.insuranceApp = new MobileInsuranceApp();
});
