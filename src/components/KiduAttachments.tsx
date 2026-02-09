// KiduAttachments.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form, Table, Spinner, Alert, OverlayTrigger, Tooltip, Accordion, Card } from "react-bootstrap";
import { Upload, Download, Trash2, FileText, X, FileSpreadsheet, FileImage, FileArchive, FileAudio, FileVideo, FileJson, FileCode, FileType } from "lucide-react";
import { useDropzone } from "react-dropzone";
import type { Attachment } from "../types/common/Attachment.types";
import AttachmentService from "../services/common/Attachment.services";

interface AttachmentsProps {
    tableName: string;
    recordId: string | number;
}

const KiduAttachments: React.FC<AttachmentsProps> = ({ tableName, recordId }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>("");
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (tableName && recordId) fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableName, recordId]);

    const fetchAttachments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AttachmentService.getByTableAndId(tableName, recordId);
            setAttachments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch attachments:", err);
            setError("Failed to load attachments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setUploadError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        maxSize: 10485760,
        onDropRejected: (fileRejections) => {
            setUploadError(fileRejections[0]?.errors[0]?.message || "File rejected");
        }
    });

    const formatDate = (dateString: string): string => {
    // Add 'Z' to force JavaScript to treat it as UTC
    const date = new Date(dateString + 'Z');
    
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
    const istDate = new Date(date.getTime() + istOffset);
    
    const day = istDate.getUTCDate().toString().padStart(2, '0');
    const month = istDate.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
    const year = istDate.getUTCFullYear();
    
    let hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError("Please select a file to upload");
            return;
        }

        try {
            setUploading(true);
            setUploadError(null);

            const formData = new FormData();
            formData.append("File", selectedFile);
            formData.append("TableName", tableName);
            formData.append("RecordId", Number(recordId).toString());
            if (description) formData.append("Description", description);

            await AttachmentService.uploadAttachment(formData);
            await fetchAttachments();
            handleCloseModal();
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadError("Failed to upload file. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const confirmDeleteAttachment = (attachmentId: number) => {
        setAttachmentToDelete(attachmentId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!attachmentToDelete) return;
        const deletedBy = localStorage.getItem("userName") || "Unknown User";

        try {
            await AttachmentService.deleteAttachment(attachmentToDelete, deletedBy);
            await fetchAttachments();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete attachment. Please try again.");
        } finally {
            setShowDeleteModal(false);
            setAttachmentToDelete(null);
        }
    };

    const handleDownload = async (attachmentId: number, fileName: string) => {
        try {
            await AttachmentService.downloadAttachment(attachmentId, fileName);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download file. Please try again.");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setDescription("");
        setUploadError(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    // const formatDate = (dateString: string): string => {
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString("en-GB", {
    //         day: "2-digit",
    //         month: "long",
    //         year: "numeric",
    //         hour: "2-digit",
    //         minute: "2-digit",
    //     });
    // };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();

        switch (ext) {
            case "pdf": return <FileText size={20} className="text-danger" />;
            case "xls":
            case "xlsx": return <FileSpreadsheet size={20} className="text-success" />;
            case "doc":
            case "docx": return <FileText size={20} className="text-primary" />;
            case "png":
            case "jpg":
            case "jpeg":
            case "gif": return <FileImage size={20} className="text-warning" />;
            case "zip":
            case "rar": return <FileArchive size={20} className="text-secondary" />;
            case "mp3":
            case "wav": return <FileAudio size={20} className="text-info" />;
            case "mp4":
            case "mov":
            case "avi": return <FileVideo size={20} className="text-info" />;
            case "json": return <FileJson size={20} className="text-muted" />;
            case "js":
            case "jsx":
            case "ts":
            case "tsx":
            case "html":
            case "css": return <FileCode size={20} className="text-purple-600" />;
            default: return <FileType size={20} className="text-dark" />;
        }
    };

    return (
        <>
            <Accordion
                alwaysOpen
                className="mt-4 mb-4 custom-accordion"
                style={{
                    maxWidth: "100%",
                    fontSize: "0.85rem",
                    backgroundColor: "#f0f0f0ff",
                }}
            >
                <Accordion.Item eventKey="0">
                    <Card.Header
                        as={Accordion.Button}
                        className="custom-attachment-header"
                        style={{
                            backgroundColor: "#882626ff",
                            color: "white",
                            width: "100%",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            height: "50px",
                        }}
                    >
                        <h6 className="mb-0 fw-medium head-font">Attachments</h6>
                    </Card.Header>

                    <Accordion.Body>
                        <Card
                            style={{
                                maxWidth: "100%",
                                fontSize: "0.85rem",
                                backgroundColor: "#f0f0f0ff",
                                border: "1px solid #ccc",
                                borderRadius: "0.5rem",
                            }}
                            className="shadow-sm"
                        >
                            <Card.Body style={{ padding: "1rem" }} className="border border-1 m-2">
                                <div className="d-flex justify-content-end mb-3">
                                    <Button 
                                        size="sm" 
                                        className="head-font fw-bold" 
                                        style={{ backgroundColor: "#882626ff", border: "none" }} 
                                        onClick={() => setShowModal(true)}
                                    >
                                        <Upload size={16} className="me-1 head-font" /> Add Attachment
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Loading attachments...</p>
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger">{error}</Alert>
                                ) : attachments.length === 0 ? (
                                    <p className="text-center text-muted mb-0">
                                        No attachments available.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover size="sm" className="align-middle">
                                            <thead style={{ backgroundColor: "#882626ff", color: "white" }}>
                                                <tr className="head-font text-center">
                                                    <th style={{ width: "5%" }}>SL No</th>
                                                    <th style={{ width: "30%" }}>File Name</th>
                                                    <th style={{ width: "20%" }}>Description</th>
                                                    <th style={{ width: "10%" }}>Size</th>
                                                    <th style={{ width: "25%" }}>Uploaded</th>
                                                    <th style={{ width: "10%" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attachments.map((attachment, idx) => (
                                                    <tr key={attachment.attachmentId} className="head-font">
                                                        <td className="text-center">{idx + 1}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {getFileIcon(attachment.fileName)}
                                                                <span className="text-truncate" style={{ maxWidth: "250px" }}>
                                                                    {attachment.fileName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                                                                {attachment.description || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">{attachment.fileSize}</td>
                                                        <td className="text-center">
                                                            <small className="text-muted">
                                                                {formatDate(attachment.uploaddedOn)}
                                                                <br />
                                                                <span className="text-muted">by {attachment.uploadedBy}</span>
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1 justify-content-center">
                                                                <OverlayTrigger overlay={<Tooltip>Download</Tooltip>}>
                                                                    <Button 
                                                                        variant="outline-primary" 
                                                                        size="sm" 
                                                                        onClick={() => handleDownload(attachment.attachmentId, attachment.fileName)}
                                                                    >
                                                                        <Download size={16} />
                                                                    </Button>
                                                                </OverlayTrigger>

                                                                <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm" 
                                                                        onClick={() => confirmDeleteAttachment(attachment.attachmentId)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg" className="head-font">
                <Modal.Header closeButton style={{ backgroundColor: "#882626ff", color: "white" }}>
                    <Modal.Title className="fs-5"><Upload size={20} className="me-2" /> Upload Attachment</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {uploadError && <Alert variant="danger">{uploadError}</Alert>}

                    <div 
                        {...getRootProps()} 
                        style={{ 
                            border: "2px dashed #882626ff", 
                            borderRadius: "8px", 
                            padding: "40px", 
                            textAlign: "center", 
                            cursor: "pointer", 
                            backgroundColor: isDragActive ? "#f8e5e5" : "#f8f9fa", 
                            transition: "all 0.3s ease" 
                        }}
                    >
                        <input {...getInputProps()} />
                        <Upload size={48} className="mb-3" style={{ color: "#882626ff" }} />
                        {isDragActive ? (
                            <p className="mb-0 fw-medium" style={{ color: "#882626ff" }}>Drop the file here...</p>
                        ) : (
                            <>
                                <p className="mb-2 fw-medium">Drag & drop a file here, or click to select</p>
                                <p className="text-muted small mb-0">Maximum file size: 10MB</p>
                            </>
                        )}
                    </div>

                    {selectedFile && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    {getFileIcon(selectedFile.name)}
                                    <div>
                                        <p className="mb-0 fw-medium">{selectedFile.name}</p>
                                        <small className="text-muted">{formatFileSize(selectedFile.size)}</small>
                                    </div>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => setSelectedFile(null)}>
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>
                    )}

                    <Form.Group className="mt-3">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Enter a description for this file..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            maxLength={500} 
                        />
                        <Form.Text className="text-muted">{description.length}/500 characters</Form.Text>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || uploading} 
                        style={{ backgroundColor: "#882626ff", borderColor: "#882626ff" }}
                    >
                        {uploading ? (
                            <>
                                <Spinner size="sm" className="me-2" /> Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} className="me-2" /> Upload
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this attachment?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
                    <Button variant="danger" onClick={handleDeleteConfirmed}>Yes, Delete</Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .custom-attachment-header.accordion-button {
                    background-color: #882626ff !important;
                    color: white !important;
                    box-shadow: none !important;
                }
                .custom-attachment-header.accordion-button:not(.collapsed) {
                    background-color: #882626ff !important;
                    color: white !important;
                }
                .custom-attachment-header.accordion-button::after {
                    filter: invert(1);
                }
            `}</style>
        </>
    );
};

export default KiduAttachments;