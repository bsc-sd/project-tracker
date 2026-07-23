
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { projectUpdatesApi, projectsApi, statusesApi } from "../api/endpoints";
import type { ProjectUpdateRecord, ProjectUpdateForm, Project, Status } from "../types";

const ProjectUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<ProjectUpdateRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdateRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectUpdateRecord | null>(null);
  const [form, setForm] = useState<ProjectUpdateForm>({
    project_id: 0,
    update_details: "",
    status_id: 0,
  });

  const fetchData = async () => {
    try {
      const [updRes, projRes, stRes] = await Promise.all([
        projectUpdatesApi.getAll(),
        projectsApi.getAll(),
        statusesApi.getAll(),
      ]);
      setUpdates(updRes.data);
      setProjects(projRes.data);
      setStatuses(stRes.data);
    } catch {
      toast.error("Failed to load project updates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingUpdate(null);
    setForm({
      project_id: projects[0]?.id || 0,
      update_details: "",
      status_id: statuses[0]?.id || 0,
    });
    setShowModal(true);
  };

  const openEdit = (update: ProjectUpdateRecord) => {
    setEditingUpdate(update);
    setForm({
      project_id: update.project_id,
      update_details: update.update_details,
      status_id: update.status_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUpdate) {
        await projectUpdatesApi.update(editingUpdate.id, {
          update_details: form.update_details,
          status_id: form.status_id,
        });
        toast.success("Update modified");
      } else {
        await projectUpdatesApi.create(form);
        toast.success("Project update created");
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
      await projectUpdatesApi.delete(deleteTarget.id);
      toast.success("Update deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete update");
    }
  };

  const columns = [
    {
      key: "project_id",
      label: "Project",
      render: (u: ProjectUpdateRecord) => {
        const proj = projects.find((p) => p.id === u.project_id);
        return proj?.project_name || `Project #${u.project_id}`;
      },
    },
    {
      key: "update_details",
      label: "Details",
      render: (u: ProjectUpdateRecord) =>
        u.update_details.length > 80
          ? u.update_details.substring(0, 80) + "..."
          : u.update_details,
    },
    {
      key: "status_name",
      label: "Status",
      render: (u: ProjectUpdateRecord) => u.status_name || "—",
    },
    {
      key: "update_date",
      label: "Date",
      render: (u: ProjectUpdateRecord) => new Date(u.update_date).toLocaleDateString(),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Project Updates</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Update
        </button>
      </div>

      <DataTable
        columns={columns}
        data={updates}
        onEdit={openEdit}
        onDelete={(u) => setDeleteTarget(u)}
      />

      <FormModal
        isOpen={showModal}
        title={editingUpdate ? "Edit Update" : "Create Project Update"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        {!editingUpdate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select
              className="select-field"
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Update Details *</label>
          <textarea
            className="input-field"
            rows={4}
            value={form.update_details}
            onChange={(e) => setForm({ ...form, update_details: e.target.value })}
            placeholder="Describe the update..."
            required
          />
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
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Update"
        message="Are you sure you want to delete this project update? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProjectUpdates;

