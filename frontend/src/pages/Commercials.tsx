
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus } from "react-icons/hi";
import DataTable from "../components/common/DataTable";
import FormModal from "../components/common/FormModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { commercialsApi, projectsApi } from "../api/endpoints";
import type { ProjectCommercial, ProjectCommercialForm, Project } from "../types";

const Commercials: React.FC = () => {
  const [commercials, setCommercials] = useState<ProjectCommercial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState<ProjectCommercial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectCommercial | null>(null);
  const [form, setForm] = useState<ProjectCommercialForm>({
    project_id: 0,
    mrc: 0,
    otc: 0,
    ps_cost: 0,
    ps_mandays: 0,
    contract_term: 0,
  });

  const fetchData = async () => {
    try {
      const [commRes, projRes] = await Promise.all([
        commercialsApi.getAll(),
        projectsApi.getAll(),
      ]);
      setCommercials(commRes.data);
      setProjects(projRes.data);
    } catch {
      toast.error("Failed to load commercials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingCommercial(null);
    setForm({
      project_id: projects[0]?.id || 0,
      mrc: 0,
      otc: 0,
      ps_cost: 0,
      ps_mandays: 0,
      contract_term: 0,
    });
    setShowModal(true);
  };

  const openEdit = (comm: ProjectCommercial) => {
    setEditingCommercial(comm);
    setForm({
      project_id: comm.project_id,
      mrc: Number(comm.mrc),
      otc: Number(comm.otc),
      ps_cost: Number(comm.ps_cost),
      ps_mandays: comm.ps_mandays,
      contract_term: comm.contract_term,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCommercial) {
        const { project_id: _pid, ...updateData } = form;
        await commercialsApi.update(editingCommercial.id, updateData);
        toast.success("Commercial data updated");
      } else {
        await commercialsApi.create(form);
        toast.success("Commercial data created");
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
      await commercialsApi.delete(deleteTarget.id);
      toast.success("Commercial data deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete commercial data");
    }
  };

  const calculatedTCV = form.mrc * form.contract_term + form.otc;

  const columns = [
    {
      key: "project_id",
      label: "Project",
      render: (c: ProjectCommercial) => {
        const proj = projects.find((p) => p.id === c.project_id);
        return proj?.project_name || `Project #${c.project_id}`;
      },
    },
    {
      key: "mrc",
      label: "MRC",
      render: (c: ProjectCommercial) => `$${Number(c.mrc).toLocaleString()}`,
    },
    {
      key: "otc",
      label: "OTC",
      render: (c: ProjectCommercial) => `$${Number(c.otc).toLocaleString()}`,
    },
    {
      key: "ps_cost",
      label: "PS Cost",
      render: (c: ProjectCommercial) => `$${Number(c.ps_cost).toLocaleString()}`,
    },
    { key: "ps_mandays", label: "PS Mandays" },
    { key: "contract_term", label: "Term (mo)" },
    {
      key: "total_contract_value",
      label: "TCV",
      render: (c: ProjectCommercial) => (
        <span className="font-semibold text-primary-700">
          ${Number(c.total_contract_value).toLocaleString()}
        </span>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Project Commercials</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          New Commercial
        </button>
      </div>

      <DataTable
        columns={columns}
        data={commercials}
        onEdit={openEdit}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <FormModal
        isOpen={showModal}
        title={editingCommercial ? "Edit Commercial Data" : "Create Commercial Data"}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      >
        {!editingCommercial && (
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MRC ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.mrc}
              onChange={(e) => setForm({ ...form, mrc: Number(e.target.value) })}
              min={0}
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTC ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.otc}
              onChange={(e) => setForm({ ...form, otc: Number(e.target.value) })}
              min={0}
              step="0.01"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PS Cost ($)</label>
            <input
              type="number"
              className="input-field"
              value={form.ps_cost}
              onChange={(e) => setForm({ ...form, ps_cost: Number(e.target.value) })}
              min={0}
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PS Mandays</label>
            <input
              type="number"
              className="input-field"
              value={form.ps_mandays}
              onChange={(e) => setForm({ ...form, ps_mandays: Number(e.target.value) })}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract Term (months)</label>
          <input
            type="number"
            className="input-field"
            value={form.contract_term}
            onChange={(e) => setForm({ ...form, contract_term: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-primary-700">
            <span className="font-medium">Calculated TCV:</span>{" "}
            <span className="font-bold">${calculatedTCV.toLocaleString()}</span>
            <span className="text-xs ml-2">(MRC × Term + OTC)</span>
          </p>
        </div>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Commercial Data"
        message="Are you sure you want to delete this commercial data? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Commercials;

