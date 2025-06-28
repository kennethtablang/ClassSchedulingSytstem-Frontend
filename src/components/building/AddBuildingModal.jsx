import { useForm } from "react-hook-form";
import { addBuilding } from "../../services/buildingService";
import { toast } from "react-toastify";
import { useState } from "react";

const AddBuildingModal = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await addBuilding(data);
      toast.success("Building added successfully");
      reset();
      setIsOpen(false);
      onSuccess?.(); // Notify parent to reload
    } catch {
      toast.error("Failed to add building");
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + Add Building
      </button>

      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Building</h3>
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
                <label className="label">Description (optional)</label>
                <textarea
                  {...register("description")}
                  className="textarea textarea-bordered w-full"
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddBuildingModal;
