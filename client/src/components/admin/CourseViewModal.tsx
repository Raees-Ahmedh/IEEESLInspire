import React, { useEffect, useState } from 'react';

type CourseViewModalProps = {
  isOpen: boolean;
  courseId: number | null;
  onClose: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseViewModal: React.FC<CourseViewModalProps> = ({ isOpen, courseId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [subjectsMap, setSubjectsMap] = useState<Record<number, { code: string; name: string }> >({});
  const [streamsMap, setStreamsMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !courseId) return;
      try {
        setLoading(true);
        setError(null);
        // Use admin details endpoint for richer data
        const res = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || json.message || 'Failed to load course');
        }
        setCourse(json.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, courseId]);

  // Load supporting lookups (AL subjects and streams) for nicer labels
  useEffect(() => {
    const loadLookups = async () => {
      if (!isOpen) return;
      try {
        const [subsRes, streamsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/subjects?level=AL`),
          fetch(`${API_BASE_URL}/admin/streams`)
        ]);
        if (subsRes.ok) {
          const s = await subsRes.json();
          if (s.success && Array.isArray(s.data)) {
            const map: Record<number, { code: string; name: string }> = {};
            s.data.forEach((sub: any) => { map[sub.id] = { code: sub.code, name: sub.name }; });
            setSubjectsMap(map);
          }
        }
        if (streamsRes.ok) {
          const st = await streamsRes.json();
          if (st.success && Array.isArray(st.data)) {
            const map: Record<number, string> = {};
            st.data.forEach((r: any) => { map[r.id] = r.name; });
            setStreamsMap(map);
          }
        }
      } catch {}
    };
    loadLookups();
  }, [isOpen]);

  const formatDuration = (months?: number) => {
    if (!months) return '—';
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y && m) return `${y}y ${m}m`;
    if (y) return `${y}y`;
    return `${m}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          {!loading && !error && course && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="text-2xl font-semibold text-gray-900">{course.name}</div>
                <div className="text-sm text-gray-600">{course.courseCode || 'No code'}</div>
              </div>

              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">University</div>
                  <div className="text-sm text-gray-900">{course.university?.name}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Faculty / Department</div>
                  <div className="text-sm text-gray-900">{course.faculty?.name || '—'}{course.department ? ` / ${course.department.name}` : ''}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Framework</div>
                  <div className="text-sm text-gray-900">{course.framework ? `${course.framework.type} Level ${course.framework.level}` : '—'}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Type / Mode</div>
                  <div className="text-sm text-gray-900">{course.courseType} / {course.studyMode}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Fee</div>
                  <div className="text-sm text-gray-900">{course.feeType === 'paid' ? (course.feeAmount ?? 'N/A') : 'Free'}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Duration</div>
                  <div className="text-sm text-gray-900">{formatDuration(course.durationMonths)}</div>
                </div>
                <div className="bg-gray-50 rounded p-3 md:col-span-2">
                  <div className="text-xs uppercase text-gray-500">Medium</div>
                  <div className="text-sm text-gray-900">{Array.isArray(course.medium) && course.medium.length ? course.medium.join(', ') : '—'}</div>
                </div>
              </div>

              {/* Specialisation & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-800 mb-1">Specialisation</div>
                  <div className="text-sm text-gray-700">{Array.isArray(course.specialisation) && course.specialisation.length ? course.specialisation.join(', ') : '—'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 mb-1">Description</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{course.description || '—'}</div>
                </div>
              </div>

              {/* Z-Score & Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Z-Score</div>
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">{course.zscore ? JSON.stringify(course.zscore, null, 2) : '—'}</pre>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xs uppercase text-gray-500">Additional Details</div>
                  <div className="text-xs text-gray-800 space-y-1">
                    <div>Intake Count: {course.additionalDetails?.intakeCount || '—'}</div>
                    <div>Syllabus: {course.additionalDetails?.syllabus ? <pre className="whitespace-pre-wrap">{course.additionalDetails.syllabus}</pre> : '—'}</div>
                    {Array.isArray(course.additionalDetails?.dynamicFields) && course.additionalDetails.dynamicFields.length > 0 && (
                      <div>
                        <div className="font-medium">Dynamic Fields</div>
                        <div className="mt-1 space-y-1">
                          {course.additionalDetails.dynamicFields.map((f: any) => (
                            <div key={f.id} className="flex items-center justify-between text-gray-700">
                              <span className="text-[12px]">{f.fieldName}</span>
                              <span className="text-[12px] font-medium">{f.fieldValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {course.requirements && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-800">Requirements</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs uppercase text-gray-500">Minimum</div>
                      <div className="text-sm text-gray-900">{course.requirements.minRequirement}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-3 md:col-span-2">
                      <div className="text-xs uppercase text-gray-500">Streams</div>
                      <div className="text-sm text-gray-900">{Array.isArray(course.requirements.stream) && course.requirements.stream.length
                        ? course.requirements.stream.map((id: number) => streamsMap[id] || id).join(', ')
                        : '—'}</div>
                    </div>
                  </div>

                  {course.requirements.ruleOLGrades && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs uppercase text-gray-500">O/L Grades</div>
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">{JSON.stringify(course.requirements.ruleOLGrades, null, 2)}</pre>
                    </div>
                  )}

                  {Array.isArray(course.requirements.ruleSubjectBasket) && course.requirements.ruleSubjectBasket.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs uppercase text-gray-500">Subject Baskets</div>
                      {course.requirements.ruleSubjectBasket.map((b: any, idx: number) => (
                        <div key={idx} className="border rounded p-3">
                          <div className="text-sm font-medium text-gray-900">{b.name || `Basket ${idx + 1}`}</div>
                          <div className="text-xs text-gray-600">Min {b.minRequired} / Max {b.maxAllowed ?? 3} • Logic {b.logic || 'AND'}</div>
                          {Array.isArray(b.subjects) && (
                            <div className="text-xs text-gray-700 mt-1">
                              Subjects: {b.subjects.map((sid: number) => subjectsMap[sid]?.code || sid).join(', ')}
                            </div>
                          )}
                          {Array.isArray(b.gradeRequirements) && b.gradeRequirements.length > 0 && (
                            <div className="text-xs text-gray-700 mt-1">
                              Grade Requirements: {b.gradeRequirements.map((gr: any) => `${gr.count} × ${gr.grade}`).join(', ')}
                            </div>
                          )}
                          {Array.isArray(b.subjectSpecificGrades) && b.subjectSpecificGrades.length > 0 && (
                            <div className="text-xs text-gray-700 mt-1">
                              Specific Grades: {b.subjectSpecificGrades.map((sg: any) => `${subjectsMap[sg.subjectId]?.code || sg.subjectId}: ${sg.grade}`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {course.requirements.ruleSubjectGrades && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs uppercase text-gray-500">Subject Grade Rules</div>
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">{JSON.stringify(course.requirements.ruleSubjectGrades, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CourseViewModal;


