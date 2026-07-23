
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { statusesApi } from "../api/endpoints";
import type { Status, StatusForm } from "../types";

const Statuses: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Status | null>(null);
  const [form, setForm] = useState<StatusForm>({ status_name: "" });

  const fetchData = async () => {
    try {
      const res = await statusesApi.getAll();
      setStatuses(res.data);
    } catch {
      toast.error("Failed to load statuses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingStatus(null);
    setForm({ status_name: "" });
    setShowModal(true);
  };

  const openEdit = (status: Status) => {
    setEditingStatus(status);
    setForm({ status_name: status.status_name });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStatus) {
        await statusesApi.update(editingStatus.id, form);
        toast.success("Status updated");
      } else {
        await statusesApi.create(form);
        toast.success("Status created");
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
      await statusesApi.delete(deleteTarget.id);
      toast.success("Status deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete status. It may be in use by projects.");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "status_name", label: "Status Name" },
    {
      key: "created_at",
      label: "Created",
      render: (s: Status) => new Date(s.created_at).toLocaleDateString(),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Statuses</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Status
        </button>
      </div>

      <DataTable
        columns={columns}
        data={statuses}
        onEdit={openEdit}
        onDelete={(s) => setDeleteTarget(s)}
      />

      <FormModal
        isOpen={showModal}
        title={editingStatus ? "Edit Status" : "Create Status"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Name *</label>
          <input
            className="input-field"
            value={form.status_name}
            onChange={(e) => setForm({ status_name: e.target.value })}
            placeholder="e.g., In Progress"
            required
          />
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Status"
        message={`Are you sure you want to delete "${deleteTarget?.status_name}"? This cannot be undone if projects use this status.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Statuses;

