import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import { uploadService } from '../../services/uploadService';

type EditCourseModalProps = {
  isOpen: boolean;
  courseId: number;
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface CourseMaterial {
  id?: number;
  materialType: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  file?: File;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, courseId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);

  // Editable fields
  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseUrl, setCourseUrl] = useState('');
  const [courseType, setCourseType] = useState<'internal' | 'external'>('internal');
  const [studyMode, setStudyMode] = useState<'fulltime' | 'parttime'>('fulltime');
  const [feeType, setFeeType] = useState<'free' | 'paid'>('free');
  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [durationMonths, setDurationMonths] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState<string[]>([]);

  // Course materials state
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
    materialType: 'syllabus',
    fileName: '',
    filePath: '',
    fileType: '',
    fileSize: 0,
    file: undefined
  });

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !courseId) return;
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading course data for ID:', courseId);
        const res = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        console.log('📥 Course load response status:', res.status);
        const json = await res.json();
        console.log('📥 Course load response data:', json);
        if (!res.ok || !json.success) {
          throw new Error(json.error || json.message || 'Failed to load course');
        }
        const c = json.data;
        console.log('📋 Course data loaded:', c);
        setCourse(c);
        // Seed editable fields
        setName(c.name || '');
        setCourseCode(c.courseCode || '');
        setCourseUrl(c.courseUrl || '');
        setCourseType(c.courseType || 'internal');
        setStudyMode(c.studyMode || 'fulltime');
        setFeeType(c.feeType || 'free');
        setFeeAmount(c.feeAmount ?? null);
        setDurationMonths(c.durationMonths ?? null);
        setDescription(c.description || '');
        setMedium(Array.isArray(c.medium) ? c.medium : []);
        
        // Load course materials
        if (c.courseMaterials && Array.isArray(c.courseMaterials)) {
          setCourseMaterials(c.courseMaterials);
        } else {
          setCourseMaterials([]);
        }
        console.log('✅ Course form fields populated');
      } catch (e: any) {
        setError(e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, courseId]);

  const canSave = useMemo(() => {
    const nameValid = name.trim().length > 0;
    const urlValid = courseUrl.trim().length > 0;
    const feeValid = feeType !== 'paid' || (feeAmount && feeAmount > 0);
    
    console.log('🔍 canSave validation:', { 
      nameValid, 
      urlValid, 
      feeValid, 
      name: name.trim(), 
      courseUrl: courseUrl.trim(), 
      feeType, 
      feeAmount 
    });
    
    return nameValid && urlValid && feeValid;
  }, [name, courseUrl, feeType, feeAmount]);

  // Course material functions
  const handleAddMaterial = async () => {
    if (!newMaterial.file || !newMaterial.materialType) {
      setUploadError('Please select a file and material type');
      return;
    }

    // Validate file
    const validation = uploadService.validateFile(newMaterial.file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Upload file to Cloudinary
      const result = await uploadService.uploadCourseMaterial(
        newMaterial.file,
        newMaterial.materialType,
        1 // TODO: Get actual user ID from auth context
      );

      if (result.success) {
        // Add the uploaded material to the list
        const uploadedMaterial = {
          id: result.data.id,
          materialType: result.data.materialType,
          fileName: result.data.fileName,
          filePath: result.data.filePath,
          fileType: result.data.fileType,
          fileSize: result.data.fileSize
        };

        setCourseMaterials(prev => [...prev, uploadedMaterial]);
        
        // Reset form
        setNewMaterial({
          materialType: 'syllabus',
          fileName: '',
          filePath: '',
          fileType: '',
          fileSize: 0,
          file: undefined
        });
        
        setUploadProgress(100);
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadError(null);
      }, 3000);
    }
  };

  const handleRemoveMaterial = async (materialId: number) => {
    try {
      // Delete from server
      const result = await uploadService.deleteCourseMaterial(materialId);
      if (result.success) {
        // Remove from local state
        setCourseMaterials(prev => prev.filter(material => material.id !== materialId));
      } else {
        setError(result.error || 'Failed to delete material');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete material');
    }
  };

  const handleSave = async () => {
    console.log('🔍 handleSave called, canSave:', canSave);
    console.log('🔍 Form data:', { name, courseUrl, feeType, feeAmount });
    if (!canSave) {
      console.log('❌ Cannot save - validation failed');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      console.log('🔄 Starting save process...');
      const payload: any = {
        name,
        courseCode: courseCode || null,
        courseUrl,
        courseType,
        studyMode,
        feeType,
        feeAmount: feeType === 'paid' ? feeAmount : null,
        durationMonths,
        description: description || null,
        medium,
        materialIds: courseMaterials.map(material => material.id).filter(id => id !== undefined),
      };
      console.log('📤 Sending payload:', payload);

      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload),
      });
      console.log('📥 Response status:', res.status);
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = j.error || j.message || msg; } catch {}
        console.error('❌ Save failed:', msg);
        throw new Error(msg);
      }
      console.log('✅ Save successful');
      if (onSaved) await onSaved();
      onClose();
    } catch (e: any) {
      console.error('❌ Save error:', e);
      setError(e.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Course</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-4 max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm mb-3">{error}</div>
          )}
          {!loading && course && (
            <div className="space-y-6">
              {/* Read-only complex relations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded p-3">
                <div>
                  <div className="text-xs uppercase text-gray-500">University</div>
                  <div className="text-sm text-gray-900">{course.university?.name}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Faculty / Department</div>
                  <div className="text-sm text-gray-900">{course.faculty?.name || '—'}{course.department ? ` / ${course.department.name}` : ''}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Framework</div>
                  <div className="text-sm text-gray-900">{course.framework ? `${course.framework.type} Level ${course.framework.level}` : '—'}</div>
                </div>
              </div>

              {/* Editable basics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course URL</label>
                  <input value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  <select value={courseType} onChange={(e) => setCourseType(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Study Mode</label>
                  <select value={studyMode} onChange={(e) => setStudyMode(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="fulltime">Full Time</option>
                    <option value="parttime">Part Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                  <select value={feeType} onChange={(e) => setFeeType(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                {feeType === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (LKR)</label>
                    <input type="number" min={0} step={0.01} value={feeAmount ?? ''} onChange={(e) => setFeeAmount(e.target.value ? Number(e.target.value) : null)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                  <input type="number" min={1} max={120} value={durationMonths ?? ''} onChange={(e) => setDurationMonths(e.target.value ? Number(e.target.value) : null)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
                <div className="flex flex-wrap gap-2">
                  {['English', 'Sinhala', 'Tamil'].map((m) => (
                    <label key={m} className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded border">
                      <input type="checkbox" checked={medium.includes(m)} onChange={() => setMedium((prev) => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} />
                      <span className="text-sm text-gray-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Course Materials Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Materials
                </label>

                <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Add Course Material</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={newMaterial.materialType}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, materialType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="syllabus">Syllabus</option>
                      <option value="brochure">Brochure</option>
                      <option value="handbook">Handbook</option>
                      <option value="application_form">Application Form</option>
                    </select>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewMaterial(prev => ({
                            ...prev,
                            fileName: file.name,
                            filePath: file.name, // Will be set by backend
                            fileType: file.type,
                            fileSize: file.size,
                            file: file // Add the actual file object
                          }));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleAddMaterial}
                    disabled={uploading || !newMaterial.file || !newMaterial.materialType}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Add Material'}</span>
                  </button>
                </div>

                {/* Display existing materials */}
                {courseMaterials.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900 mb-2">Course Materials ({courseMaterials.length})</h5>
                    {courseMaterials.map(material => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{material.fileName}</div>
                            <div className="text-gray-600">
                              <span className="capitalize">{material.materialType}</span>
                              {material.fileSize && (
                                <span> • {uploadService.formatFileSize(material.fileSize)}</span>
                              )}
                              {material.fileType && (
                                <span> • {material.fileType.split('/')[1]?.toUpperCase()}</span>
                              )}
                            </div>
                            {material.filePath && (
                              <div className="text-xs text-blue-600 truncate max-w-xs">
                                {material.filePath}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMaterial(material.id!)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Read-only complex requirements */}
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2">Existing Requirements (read-only)</div>
                {course.requirements ? (
                  <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto text-gray-800 whitespace-pre-wrap">{JSON.stringify(course.requirements, null, 2)}</pre>
                ) : (
                  <div className="text-sm text-gray-500">No requirements found</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200">Cancel</button>
          <button disabled={!canSave || saving} onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;


