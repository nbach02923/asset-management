import { useState, useEffect, useCallback } from "react";
import API from "../../services/request";
import createAllField from "../../utils/field";
import { Box, Button } from "@mui/material";
import decodeJWT from "../../utils/decodeJWT";

const HoverButton = (props) => {
	const [hover, setHover] = useState(false);
	return (
		<Button
			variant={hover ? "contained" : "outlined"}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			{...props}
		/>
	);
};
const useAssetState = () => {
	const decoded = decodeJWT();
	const [data, setData] = useState([]);
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [fields, setFields] = useState([]);
	const [category, setCategory] = useState([]);
	const [selectedName, setSelectedName] = useState("");
	const [selectedType, setSelectedType] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [selectedDescription, setSelectedDescription] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState(null);
	const [currentAction, setCurrentAction] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [showWarning, setShowWarning] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);
	const [responseMessage, setResponseMessage] = useState("");
	const [errorStatusCode, setErrorStatusCode] = useState(null);
	const [updateData, setUpdateData] = useState(false);
	const [selectedAllocateDate, setSelectedAllocateDate] = useState("");
	const [selectedReturnDate, setSelectedReturnDate] = useState("");
	const [total, setTotal] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [openUpload, setOpenUpload] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [selectedValue, setSelectedValue] = useState("All");
	const filterCheckBox = ["All", "Ready to Deploy", "Deployed", "Error"];
	const customHeaders = ["Asset Name", "Asset Picture", "Serial", "Category", "Status", "Allocation"];
	const handleCheckIn = useCallback(
		(row) => {
			setSelectedId(row.id);
			setOpen(true);
			setFields([
				createAllField.createField("Allocation Date", "date", selectedAllocateDate, setSelectedAllocateDate),
				createAllField.createField("Return Date", "date", selectedReturnDate, setSelectedReturnDate),
			]);
			setTitle("Allocate Request");
			setCurrentAction("allocate");
		},
		[selectedAllocateDate, selectedReturnDate]
	);
	const handleShowUpload = (row) => {
		setOpenUpload(true);
		setSelectedId(row.id);
		setCurrentAction("upload");
	};
	useEffect(() => {
		const querys = {
			offset: 15 * currentPage,
		};
		if (selectedValue !== "All") {
			querys.status = selectedValue;
		}
		Promise.all([API.getAPI("/asset", querys), API.getAPI("/categoryAsset", { limit: 100 })]).then(
			([assetResponse, categoryResponse]) => {
				const assetData = assetResponse.data;
				const categoryData = categoryResponse.data;
				setCategory(categoryData.category);
				const categoryMap = {};
				categoryData.category.forEach((category) => {
					categoryMap[category.id] = category.name;
				});
				setTotal(assetData.assetTotal);
				const customData = assetData.asset.map((item) => {
					return {
						id: item.id,
						name: item.name,
						picture:
							!item.picturePath && decoded.role ? (
								<HoverButton color="primary" size="small" onClick={() => handleShowUpload(item)}>
									Upload
								</HoverButton>
							) : item.picturePath && decoded.role ? (
								<Box
									component="img"
									crossOrigin="anonymous"
									alt="asset_picture"
									src={item.picturePath}
									onClick={(event) => {
										if (event.button === 0) {
											handleShowUpload(item);
										}
									}}
									onContextMenu={(event) => {
										event.preventDefault();
										window.open(item.picturePath, "_blank");
									}}
									sx={{ width: 32, height: 32, objectFit: "cover", cursor: "pointer" }}></Box>
							) : (
								<Box
									component="img"
									crossOrigin="anonymous"
									alt="asset_picture"
									src={item.picturePath}
									onContextMenu={(event) => {
										event.preventDefault();
										window.open(item.picturePath, "_blank");
									}}></Box>
							),
						serial: item.serial,
						type: item.type,
						category: categoryMap[item.categoryAssetId],
						status: item.status,
						description: item.description,
						allocation:
							item.status === "Ready to Deploy" ? (
								<HoverButton color="success" onClick={() => handleCheckIn(item)} size="small">
									Check In
								</HoverButton>
							) : (
								<></>
							),
					};
				});
				setData(customData);
			}
		);
	}, [updateData, handleCheckIn, currentPage, decoded.role, selectedValue]);
	useEffect(() => {
		if (!open) {
			setSelectedName("");
			setSelectedType("");
			setSelectedCategory("");
			setSelectedStatus("");
			setSelectedDescription("");
		} else {
			setFields((prevFields) =>
				prevFields.map((field) => {
					if (field.label === "Asset Name") {
						return { ...field, value: selectedName };
					} else if (field.label === "Type") {
						return { ...field, value: selectedType };
					} else if (field.label === "Category") {
						return { ...field, value: selectedCategory };
					} else if (field.label === "Status") {
						return { ...field, value: selectedStatus };
					} else if (field.label === "Description") {
						return { ...field, value: selectedDescription };
					} else {
						return field;
					}
				})
			);
		}
	}, [open, selectedName, selectedType, selectedCategory, selectedStatus, selectedDescription]);
	const handleAddNew = () => {
		setFields([
			createAllField.createField("Asset Name", "text", selectedName, setSelectedName),
			createAllField.createSelectField(
				"Type",
				["Stationary", "Nonstationary", "Other"],
				selectedType,
				setSelectedType
			),
			createAllField.createSelectField(
				"Category",
				category.map((item) => item.name),
				selectedCategory,
				setSelectedCategory,
				category,
				setSelectedCategoryId
			),
			createAllField.createSelectField(
				"Status",
				["Ready to Deploy", "Deployed", "Error"],
				selectedStatus,
				setSelectedStatus
			),
			createAllField.createField("Description", "textarea", selectedDescription, setSelectedDescription),
		]);
		setOpen(true);
		setTitle("Add New Asset");
		setCurrentAction("addNew");
	};
	const handleEdit = (row) => {
		const selectedCategory = category.find((item) => item.name === row.category);
		setSelectedCategoryId(selectedCategory.id);
		setSelectedId(row.id);
		setSelectedName(row.name);
		setSelectedType(row.type);
		setSelectedCategory(row.category);
		setSelectedDescription(row.description);
		setFields([
			createAllField.createField("Asset Name", "text", row.name, setSelectedName),
			createAllField.createSelectField(
				"Type",
				["Stationary", "Nonstationary", "Other"],
				row.type,
				setSelectedType
			),
			createAllField.createSelectField(
				"Category",
				category.map((item) => item.name),
				row.category,
				setSelectedCategory,
				category,
				setSelectedCategoryId
			),
			createAllField.createField("Description", "textarea", row.description, setSelectedDescription),
		]);
		setOpen(true);
		setTitle("Edit Asset");
		setCurrentAction("edit");
	};
	const handleView = (row) => {
		setCurrentAction("view");
		setSelectedId(row.id);
		setSelectedName(row.name);
		setSelectedType(row.type);
		setSelectedCategory(row.category);
		setSelectedStatus(row.status);
		setSelectedDescription(row.description);
		setFields([
			createAllField.createField("Asset Name", "text", row.name, setSelectedName, true),
			createAllField.createField("Type", "text", row.type, setSelectedType, true),
			createAllField.createField("Category", "text", row.category, setSelectedCategory, true),
			createAllField.createField("Status", "text", row.status, setSelectedStatus, true),
			createAllField.createField("Description", "textarea", row.description, setSelectedDescription, true),
		]);
		setOpen(true);
		setTitle("View Asset");
	};
	const handleDelete = (row) => {
		setSelectedId(row.id);
		setCurrentAction("delete");
		setShowWarning(true);
	};
	const handleClose = () => setOpen(false);
	const handleUploadClose = () => setOpenUpload(false);
	const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

	const handleAPI = () => {
		return new Promise((resolve, reject) => {
			if (currentAction === "addNew") {
				const payload = {
					name: selectedName,
					type: selectedType,
					status: selectedStatus,
					categoryId: selectedCategoryId,
					description: selectedDescription,
				};
				API.postAPI("/asset", undefined, payload)
					.then((response) => {
						resolve(response);
						setUpdateData((prev) => !prev);
					})
					.catch((err) => {
						reject(err);
					});
			} else if (currentAction === "edit") {
				const payload = {
					name: selectedName,
					type: selectedType,
					categoryId: selectedCategoryId,
					description: selectedDescription,
				};
				API.patchAPI(`/asset/${selectedId}`, payload)
					.then((response) => {
						resolve(response);
						setUpdateData((prev) => !prev);
					})
					.catch((err) => {
						reject(err);
					});
			} else if (currentAction === "delete") {
				setShowWarning(false);
				API.deleteAPI(`/asset/${selectedId}`)
					.then((response) => {
						resolve(response);
						setUpdateData((prev) => !prev);
						setShowSuccess(true);
						setResponseMessage("Delete Succesfully");
					})
					.catch((err) => {
						setShowError(true);
						setErrorStatusCode(err.response.status);
						if (err.response.data.details) {
							setResponseMessage(err.response.data.details.body[0].message);
						} else {
							setResponseMessage(err.response.data.message);
						}
						reject(err);
					});
			} else if (currentAction === "allocate") {
				const payload = {
					userId: decoded.id,
					allocationDate: selectedAllocateDate,
					returnDate: selectedReturnDate,
				};
				API.postAPI(`/asset/allocationAsset/${selectedId}`, undefined, payload)
					.then((response) => {
						resolve(response);
						setUpdateData((prev) => !prev);
					})
					.catch((err) => {
						reject(err);
					});
			} else if (currentAction === "upload") {
				const payload = new FormData();
				payload.append("file", selectedFile);
				payload.append("fileType", "asset");
				const uploadHeaders = {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				};
				API.postAPI(`/upload/${selectedId}`, uploadHeaders, payload)
					.then((response) => {
						setResponseMessage(response.data.message);
						setShowSuccess(true);
						setUpdateData((prev) => !prev);
					})
					.catch((err) => {
						setShowError(true);
						setErrorStatusCode(err.response.status);
						if (err.response.data.details) {
							setResponseMessage(err.response.data.details.body[0].message);
						} else {
							setResponseMessage(err.response.data.message);
						}
					});
			}
		});
	};
	const shouldRenderEditButton = () => {
		const userRole = decodeJWT().role;
		return userRole;
	};
	return {
		data,
		customHeaders,
		open,
		title,
		fields,
		handleAddNew,
		handleEdit,
		handleView,
		handleDelete,
		handleClose,
		handleAPI,
		showWarning,
		setShowWarning,
		showError,
		setShowError,
		errorStatusCode,
		responseMessage,
		showSuccess,
		setShowSuccess,
		currentAction,
		shouldRenderEditButton,
		total,
		currentPage,
		setCurrentPage,
		openUpload,
		handleUploadClose,
		selectedFile,
		handleFileChange,
		selectedValue,
		setSelectedValue,
		filterCheckBox,
	};
};
export default useAssetState;
