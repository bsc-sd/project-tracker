
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { projectsApi, techLeadsApi, statusesApi } from "../api/endpoints";
import type { Project, ProjectForm, TechLead, Status, Complexity } from "../types";

const complexityOptions: Complexity[] = ["simple", "medium", "complex"];

const complexityBadge = (complexity: string) => {
  const colors: Record<string, string> = {
    simple: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    complex: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[complexity] || "bg-gray-100"}`}>
      {complexity}
    </span>
  );
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [techLeads, setTechLeads] = useState<TechLead[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>({
    project_name: "",
    project_type: "",
    project_details: "",
    project_commercial_name: "",
    tech_lead_id: 0,
    complexity: "medium",
    status_id: 0,
    start_date: "",
    target_completion_date: "",
    actual_completion_date: "",
  });

  const fetchData = async () => {
    try {
      const [projRes, tlRes, stRes] = await Promise.all([
        projectsApi.getAll(),
        techLeadsApi.getAll(),
        statusesApi.getAll(),
      ]);
      setProjects(projRes.data);
      setTechLeads(tlRes.data);
      setStatuses(stRes.data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      project_name: "",
      project_type: "",
      project_details: "",
      project_commercial_name: "",
      tech_lead_id: techLeads[0]?.id || 0,
      complexity: "medium",
      status_id: statuses[0]?.id || 0,
      start_date: "",
      target_completion_date: "",
      actual_completion_date: "",
    });
  };

  const openCreate = () => {
    setEditingProject(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      project_name: project.project_name,
      project_type: project.project_type || "",
      project_details: project.project_details || "",
      project_commercial_name: project.project_commercial_name || "",
      tech_lead_id: project.tech_lead_id,
      complexity: project.complexity,
      status_id: project.status_id,
      start_date: project.start_date || "",
      target_completion_date: project.target_completion_date || "",
      actual_completion_date: project.actual_completion_date || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, form);
        toast.success("Project updated");
      } else {
        await projectsApi.create(form);
        toast.success("Project created");
      }
      setShowModal(false);
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectsApi.delete(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const columns = [
    { key: "project_name", label: "Project Name" },
    { key: "project_type", label: "Type" },
    { key: "tech_lead_name", label: "Tech Lead" },
    {
      key: "complexity",
      label: "Complexity",
      render: (p: Project) => complexityBadge(p.complexity),
    },
    { key: "status_name", label: "Status" },
    { key: "start_date", label: "Start Date" },
    { key: "target_completion_date", label: "Target Date" },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Projects</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
        onRowClick={(p) => navigate(`/projects/${p.id}`)}
      />

      <FormModal
        isOpen={showModal}
        title={editingProject ? "Edit Project" : "Create Project"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            className="input-field"
            value={form.project_name}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input
              className="input-field"
              value={form.project_type}
              onChange={(e) => setForm({ ...form, project_type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Name</label>
            <input
              className="input-field"
              value={form.project_commercial_name}
              onChange={(e) => setForm({ ...form, project_commercial_name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.project_details}
            onChange={(e) => setForm({ ...form, project_details: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Lead *</label>
            <select
              className="select-field"
              value={form.tech_lead_id}
              onChange={(e) => setForm({ ...form, tech_lead_id: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>Select tech lead</option>
              {techLeads.map((tl) => (
                <option key={tl.id} value={tl.id}>{tl.tech_lead_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              className="select-field"
              value={form.status_id}
              onChange={(e) => setForm({ ...form, status_id: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>Select status</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.status_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
          <select
            className="select-field"
            value={form.complexity}
            onChange={(e) => setForm({ ...form, complexity: e.target.value as Complexity })}
          >
            {complexityOptions.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input
              type="date"
              className="input-field"
              value={form.target_completion_date}
              onChange={(e) => setForm({ ...form, target_completion_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Date</label>
            <input
              type="date"
              className="input-field"
              value={form.actual_completion_date}
              onChange={(e) => setForm({ ...form, actual_completion_date: e.target.value })}
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.project_name}"? This will also remove its commercial data and updates.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Projects;

