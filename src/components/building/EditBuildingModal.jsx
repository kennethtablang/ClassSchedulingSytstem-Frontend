import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateBuilding } from "../../services/buildingService";
import { toast } from "react-toastify";
import { useState } from "react";

const EditBuildingModal = ({ building, onClose, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (building) {
      reset({
        name: building.name || "",
        description: building.description || "",
        isActive: building.isActive ?? true,
      });
    }
  }, [building, reset]);

  const onSubmit = async (data) => {
    try {
      await updateBuilding(building.id, data);
      toast.success("Building updated successfully");
      setIsOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to update building");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Building</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Building Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="input input-bordered w-full"
            />
            {errors.name && (
              <p className="text-error text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>

          <div>
            <label className="label cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="toggle toggle-primary"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditBuildingModal;
