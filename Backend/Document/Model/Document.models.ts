import { PrismaClient, ReportReason } from "@prisma/client";
import { DocumentCategory } from '@prisma/client';

const prisma = new PrismaClient();

export class DocumentModel {
    /**
     * Save a document's metadata to the database.
     */
    async saveDocument(
        school: string,
        fieldId: string,
        department: string,
        level: number,
        module: string,
        category: string,
        url: string,
        studentId: number
    ) {
        try {
            if (!Object.values(DocumentCategory).includes(category as DocumentCategory)) {
                throw new Error(`Invalid category value: ${category}. Must be one of: ${Object.values(DocumentCategory).join(", ")}`);
            }

            return await prisma.document.create({
                data: {
                    school,
                    fieldId,
                    Department: department,
                    level,
                    module,
                    date: new Date(),
                    category: category as DocumentCategory,
                    url,
                    studentId,
                    reportCount: 0, 
                },
            });
        } catch (error: any) {
            console.error(`Error saving document: ${error.message}`);
            throw new Error("Failed to save document.");
        }
    }

    /**
     * Retrieve documents by department and level.
     */
    async getDocumentsByDepartmentAndLevel(department: string, level: number) {
        try {
            return await prisma.document.findMany({
                where: { Department: department, level },
            });
        } catch (error: any) {
            console.error(`Error fetching documents: ${error.message}`);
            throw new Error("Failed to retrieve documents.");
        }
    }

    /**
     * Retrieve documents by module name.
     */
    async getDocumentsByModule(module: string) {
        try {
            return await prisma.document.findMany({
                where: { module },
            });
        } catch (error: any) {
            console.error(`Error fetching documents: ${error.message}`);
            throw new Error("Failed to retrieve documents.");
        }
    }

    /**
     * Find a document by its ID.
     */
    async findDocumentById(documentId: number) {
        try {
            return await prisma.document.findUnique({
                where: { id: documentId },
            });
        } catch (error: any) {
            console.error(`Error finding document: ${error.message}`);
            throw new Error("Failed to find document.");
        }
    }

    /**
     * Creating a report
     */

    async createReport(documentId: number, studentId: number, reason: string) {
        try {
            if (!Object.values(ReportReason).includes(reason as ReportReason)) {
                throw new Error(`Invalid report reason: ${reason}. Must be one of: ${Object.values(ReportReason).join(", ")}`);
            }
    
            return await prisma.report.create({
                data: { documentId, studentId, reason: reason as ReportReason },
            });
        } catch (error: any) {
            console.error(`Error creating report: ${error.message}`);
            throw new Error("Failed to create report.");
        }
    }    

    /**
     * Increment report count for a document.
     */
    async incrementReportCount(documentId: number) {
        try {
            return await prisma.document.update({
                where: { id: documentId },
                data: {
                    reportCount: {
                        increment: 1,
                    },
                },
            });
        } catch (error: any) {
            console.error(`Error updating report count: ${error.message}`);
            throw new Error("Failed to update report count.");
        }
    }

    /**
     * Get all reported documents (sorted by most reported).
     */
    async getReportedDocuments() {
        try {
            return await prisma.document.findMany({
                where: {
                    reportCount: {
                        gt: 0, 
                    },
                },
                orderBy: {
                    reportCount: "desc",
                },
            });
        } catch (error: any) {
            console.error(`Error fetching reported documents: ${error.message}`);
            throw new Error("Failed to retrieve reported documents.");
        }
    }

    /**
     * Delete a reported document by its ID.
     */
    async deleteReportedDocument(documentId: number) {
        try {
            // Check if the document exists
            const document = await prisma.document.findUnique({
                where: { id: documentId },
            });

            if (!document) {
                throw new Error("Document not found.");
            }

            // Delete the document
            await prisma.document.delete({
                where: { id: documentId },
            });

            return { message: "Document deleted successfully." };
        } catch (error: any) {
            console.error(`Error deleting document: ${error.message}`);
            throw new Error("Failed to delete document.");
        }
    }

}
