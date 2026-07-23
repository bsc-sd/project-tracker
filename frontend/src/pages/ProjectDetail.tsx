
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { projectsApi, commercialsApi, projectUpdatesApi, statusesApi } from "../api/endpoints";
import type { Project, ProjectCommercial, ProjectUpdateRecord, Status } from "../types";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [commercial, setCommercial] = useState<ProjectCommercial | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdateRecord[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update form state
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateDetails, setUpdateDetails] = useState("");
  const [updateStatusId, setUpdateStatusId] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectId = Number(id);
        const [projRes, statusRes] = await Promise.all([
          projectsApi.getById(projectId),
          statusesApi.getAll(),
        ]);
        setProject(projRes.data);
        setStatuses(statusRes.data);

        // Fetch commercial (may not exist)
        try {
          const commRes = await commercialsApi.getByProject(projectId);
          setCommercial(commRes.data);
        } catch {
          setCommercial(null);
        }

        // Fetch updates
        const updRes = await projectUpdatesApi.getByProject(projectId);
        setUpdates(updRes.data);
      } catch {
        toast.error("Failed to load project details");
        navigate("/projects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectUpdatesApi.create({
        project_id: Number(id),
        update_details: updateDetails,
        status_id: updateStatusId,
      });
      toast.success("Update added");
      setShowUpdateForm(false);
      setUpdateDetails("");

      // Refresh updates
      const updRes = await projectUpdatesApi.getByProject(Number(id));
      setUpdates(updRes.data);
    } catch {
      toast.error("Failed to add update");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!project) return null;

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
            <p className="text-gray-500 mt-1">{project.project_type || "No type specified"}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.complexity === "simple" ? "bg-green-100 text-green-700" :
              project.complexity === "medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {project.complexity}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {project.status_name}
            </span>
          </div>
        </div>

        {project.project_details && (
          <p className="mt-4 text-gray-600">{project.project_details}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Tech Lead</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{project.tech_lead_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Start Date</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{project.start_date || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Target Completion</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{project.target_completion_date || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Actual Completion</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{project.actual_completion_date || "—"}</p>
          </div>
        </div>
      </div>

      {/* Commercial Data */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Commercial Data</h2>
        {commercial ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium">MRC</p>
              <p className="text-lg font-bold text-gray-900">${Number(commercial.mrc).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium">OTC</p>
              <p className="text-lg font-bold text-gray-900">${Number(commercial.otc).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium">PS Cost</p>
              <p className="text-lg font-bold text-gray-900">${Number(commercial.ps_cost).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium">PS Mandays</p>
              <p className="text-lg font-bold text-gray-900">{commercial.ps_mandays}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium">Contract Term (months)</p>
              <p className="text-lg font-bold text-gray-900">{commercial.contract_term}</p>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <p className="text-xs text-primary-600 uppercase font-medium">Total Contract Value</p>
              <p className="text-lg font-bold text-primary-700">${Number(commercial.total_contract_value).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No commercial data available for this project.</p>
        )}
      </div>

      {/* Project Updates */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Project Updates</h2>
          <button
            onClick={() => {
              setUpdateStatusId(statuses[0]?.id || 0);
              setShowUpdateForm(!showUpdateForm);
            }}
            className="btn-primary text-sm"
          >
            Add Update
          </button>
        </div>

        {showUpdateForm && (
          <form onSubmit={handleAddUpdate} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Details *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={updateDetails}
                  onChange={(e) => setUpdateDetails(e.target.value)}
                  placeholder="Describe the update..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  className="select-field"
                  value={updateStatusId}
                  onChange={(e) => setUpdateStatusId(Number(e.target.value))}
                  required
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.status_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Save Update</button>
                <button type="button" onClick={() => setShowUpdateForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          </form>
        )}

        {updates.length === 0 ? (
          <p className="text-gray-500 text-sm">No updates recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div key={update.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{update.update_details}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(update.update_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium text-primary-600">
                      {update.status_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;

