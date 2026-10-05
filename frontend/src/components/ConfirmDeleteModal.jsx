import { useVms } from "../context/VmsContext.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDeleteModal({ vm, onClose }) {
  const { deleteVm } = useVms();

  function confirm() {
    // Optimista: se cierra y la VM desaparece ya; si la API falla, vuelve a la lista con un aviso
    onClose();
    deleteVm(vm.id);
  }

  return (
    <Modal onClose={onClose} label={`Borrar ${vm.name}`}>
      <h3>¿Borrar {vm.name}?</h3>
      <p className="muted">La VM desaparecerá del inventario. Esta acción no se puede deshacer.</p>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-danger-solid" onClick={confirm} autoFocus>
          Borrar VM
        </button>
      </div>
    </Modal>
  );
}
