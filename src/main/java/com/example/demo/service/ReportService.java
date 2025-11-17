package com.example.demo.service;

import com.example.demo.model.Report;
import com.example.demo.model.ReportStatus; 
import com.example.demo.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report submitReport(Report report) {
        return reportRepository.save(report);
    }

    public List<Report> getUserReports(Long userId) {

        return reportRepository.findByUserId(userId);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report updateStatus(Long id, String statusString) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบรายงาน"));


        try {
            ReportStatus newStatus = ReportStatus.valueOf(statusString.toUpperCase());
            report.setStatus(newStatus);
            return reportRepository.save(report);
        } catch (IllegalArgumentException e) {

            throw new RuntimeException("สถานะไม่ถูกต้อง: " + statusString);
        }
    }
}