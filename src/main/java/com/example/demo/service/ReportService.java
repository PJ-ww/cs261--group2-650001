package com.example.demo.service;

import com.example.demo.model.Report;
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

    public Report updateStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบรายงาน"));

        report.setStatus(status);
        return reportRepository.save(report);
    }
}
