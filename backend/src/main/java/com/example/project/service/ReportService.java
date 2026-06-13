package com.example.project.service;

import com.example.project.model.Event;
import com.example.project.model.User;
import com.example.project.repository.RegistrationRepository;
import com.example.project.repository.EventRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public byte[] generateAdminReport(User admin) {
        List<Event> events = eventRepository.findByCreatedByUsername(admin.getUsername());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
 
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        document.add(new Paragraph("Performance Analysis: " + admin.getName(), headerFont));
        document.add(new Paragraph("Role: Administrator"));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("Event Name");
        table.addCell("Created On");
        table.addCell("Status");
        table.addCell("Registrations");

        long approved = 0;
        long rejected = 0;

        for (Event event : events) {
            table.addCell(event.getTitle());
            table.addCell(event.getCreatedAt().toString());
            table.addCell(event.getApprovalStatus());
            table.addCell(String.valueOf(registrationRepository.findByEventId(event.getId()).size()));

            if ("APPROVED".equalsIgnoreCase(event.getApprovalStatus())) approved++;
            if ("REJECTED".equalsIgnoreCase(event.getApprovalStatus())) rejected++;
        }

        document.add(table);
        document.add(new Paragraph(" "));

        double total = events.size();
        double perf = (total > 0) ? (approved / total) * 100 : 0;

        document.add(new Paragraph("Summary Metrics:"));
        document.add(new Paragraph("Total Events Created: " + (int)total));
        document.add(new Paragraph("Approved: " + approved));
        document.add(new Paragraph("Rejected: " + rejected));
        document.add(new Paragraph("Overall Performance: " + String.format("%.2f", perf) + "%"));

        String conclusion = "Conclusion: ";
        if (perf > 80) conclusion += "Excellent. Highly effective event management.";
        else if (perf > 50) conclusion += "Satisfactory. Maintain consistency.";
        else conclusion += "Improvement needed. Please review rejection feedback.";
        
        Font conclusionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        document.add(new Paragraph(" "));
        document.add(new Paragraph(conclusion, conclusionFont));

        document.close();
        return out.toByteArray();
    }
}