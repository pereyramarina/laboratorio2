import React, { useEffect, useState, useRef } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../services/apiService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import { MultiSelect } from 'primereact/multiselect';

const CrudComponent = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemDialog, setItemDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [item, setItem] = useState({ name: '', description: '', imageUrl: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await getItems();
            setItems(response.data);
        } catch (error) {
            showError('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setItem({ name: '', description: '', imageUrl: '' });
        setSubmitted(false);
        setItemDialog(true);
    };

    const hideDialog = () => {
        setItemDialog(false);
        setSubmitted(false);
    };

    const hideViewDialog = () => {
        setViewDialog(false);
    };

    const saveItem = async () => {
        setSubmitted(true);
        if (item.name.trim()) {
            try {
                if (item.id) {
                    await updateItem(item.id, item);
                    showSuccess('Item updated successfully');
                } else {
                    await createItem(item);
                    showSuccess('Item created successfully');
                }
                loadItems();
                setItemDialog(false);
                setItem({ name: '', description: '', imageUrl: '' });
            } catch (error) {
                showError('Failed to save item');
            }
        }
    };

    const deleteSelectedItems = () => {
        confirmDialog({
            message: 'Are you sure you want to delete the selected items?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await Promise.all(selectedItems.map(item => deleteItem(item.id)));
                    showSuccess('Items deleted successfully');
                    loadItems();
                } catch (error) {
                    showError('Failed to delete items');
                }
            },
        });
    };

    // Confirmar eliminación de un solo elemento
const confirmDeleteItem = (item) => {
    confirmDialog({
        message: `Are you sure you want to delete "${item.name}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteItemById(item.id),  // Llama a la función deleteItemById para borrar el ítem
    });
};
const editItem = (item) => {
    setItem({ ...item });  // Llenamos el estado `item` con los datos del ítem seleccionado
    setItemDialog(true);   // Abrimos el cuadro de diálogo para editar el ítem
};
// Función que elimina un elemento por su ID
const deleteItemById = async (id) => {
    try {
        await deleteItem(id);  // Asume que deleteItem(id) es tu función para eliminar el ítem en la API
        showSuccess('Item deleted successfully');
        loadItems();  // Recarga los elementos para mostrar la lista actualizada
    } catch (error) {
        showError('Failed to delete item');
    }
};
    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    };

    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    };

    const onUpload = (e) => {
        setItem({ ...item, imageUrl: URL.createObjectURL(e.files[0]) });
        showSuccess('Image uploaded successfully');
    };

    const viewItemDetails = (item) => {
        setSelectedItem(item);
        setViewDialog(true);
    };

    const itemDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveItem} />
        </React.Fragment>
    );

    const deleteButton = (
        <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={deleteSelectedItems} />
    );

    const renderActions = (rowData) => (
        <React.Fragment>
            <Button icon="pi pi-search" className="p-button-rounded p-button-info" tooltip="View" onClick={() => viewItemDetails(rowData)} />
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning" onClick={() => editItem(rowData)} />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteItem(rowData)} />  {/* Usamos la función correcta */}
        </React.Fragment>
    );

    const leftToolbarTemplate = () => (
        <React.Fragment>
            <Button label="New" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
            <Button label="Delete" icon="pi pi-trash" className="p-button-danger" disabled={!selectedItems.length} onClick={deleteSelectedItems} />
        </React.Fragment>
    );

    const rightToolbarTemplate = () => (
        <MultiSelect
            value={selectedItems}
            options={items}
            onChange={(e) => setSelectedItems(e.value)}
            optionLabel="name"
            placeholder="Select items to delete"
        />
    );

    return (
        <div className="crud-demo">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                {loading ? (
                    <div className="p-d-flex p-jc-center">
                        <ProgressSpinner />
                    </div>
                ) : (
                    <DataTable value={items} paginator rows={10} responsiveLayout="scroll" selection={selectedItems} onSelectionChange={(e) => setSelectedItems(e.value)}>
                        <Column field="name" header="Name" sortable />
                        <Column field="description" header="Description" sortable />
                        <Column body={renderActions} header="Actions" />
                    </DataTable>
                )}

                <Dialog visible={itemDialog} style={{ width: '450px' }} header="Item Details" modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
                    <div className="field">
                        <label htmlFor="name">Name</label>
                        <InputText id="name" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} required />
                        {submitted && !item.name && <small className="p-error">Name is required.</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="description">Description</label>
                        <InputText id="description" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} />
                    </div>
                    <div className="field">
                        <label htmlFor="imageUrl">Image</label>
                        <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} onUpload={onUpload} />
                        {item.imageUrl && <img src={item.imageUrl} alt="item" width="150" />}
                    </div>
                </Dialog>

                <Dialog visible={viewDialog} style={{ width: '450px' }} header="View Item" modal className="p-fluid" onHide={hideViewDialog}>
                    {selectedItem && (
                        <div>
                            <div className="field">
                                <label>Name</label>
                                <p>{selectedItem.name}</p>
                            </div>
                            <div className="field">
                                <label>Description</label>
                                <p>{selectedItem.description}</p>
                            </div>
                            {selectedItem.imageUrl && <img src={selectedItem.imageUrl} alt="item" width="150" />}
                        </div>
                    )}
                </Dialog>
            </div>
        </div>
    );
};

export default CrudComponent;
