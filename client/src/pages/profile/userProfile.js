import React, { useEffect, useState, useMemo } from "react";
import {
	Box,
	Button,
	Container,
	Grid,
	InputLabel,
	Modal,
	TextField,
	Typography,
	Select,
	MenuItem,
	FormControl,
	Stack,
	Card,
	IconButton,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import API from "../../services/request";
import decodeJWT from "../../utils/decodeJWT";
import Popup from "../../components/popup";

const fields = ["Full Name", "User Name", "Email", "Phone Number", "Date of Birth", "Department"];
const UserProfile = () => {
	const headers = useMemo(() => {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
			Accept: "application/json",
		};
	}, []);
	const decoded = decodeJWT();
	const [showSuccess, setShowSuccess] = useState(false);
	const [showError, setShowError] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [errorCode, setErrorCode] = useState("");
	const [responseMessage, setResponseMessage] = useState("");
	const [data, setData] = useState(null);
	const [intialData, setInitialData] = useState(null);
	const [open, setOpen] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [department, setDepartment] = useState("");
	const [userAvatar, setUserAvatar] = useState(null);
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		setSelectedFile(null);
	};
	const handleEdit = () => setEditMode(true);
	const [selectedFile, setSelectedFile] = React.useState(null);
	const handleUpload = () => {
		const payload = new FormData();
		payload.append("file", selectedFile);
		const uploadHeaders = {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		};
		API.postAPI(`/upload/${decoded.id}`, uploadHeaders, payload)
			.then((response) => {
				setResponseMessage(response.data.message);
				setEditMode(false);
				setShowSuccess(true);
			})
			.catch((err) => {
				setShowError(true);
				setErrorCode(err.response.status);
				if (err.response.data.details) {
					setResponseMessage(err.response.data.details.body[0].message);
				} else {
					setResponseMessage(err.response.data.message);
				}
			});
	};
	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};
	const handleCancel = () => {
		setEditMode(false);
		setData(intialData);
	};
	const handleSave = () => {
		setShowWarning(true);
	};
	const handleAPI = () => {
		setShowWarning(false);
		const payload = {
			fullName: data["Full Name"],
			email: data["Email"],
			phoneNumber: data["Phone Number"],
			dateOfBirth: data["Date of Birth"],
			departmentId: department.find((item) => item.name === data["Department"]).id,
		};
		API.patchAPI(`/user/${decoded.id}`, headers, payload)
			.then((response) => {
				setResponseMessage(response.data.message);
				setEditMode(false);
				setShowSuccess(true);
			})
			.catch((err) => {
				setShowError(true);
				setErrorCode(err.response.status);
				if (err.response.data.details) {
					setResponseMessage(err.response.data.details.body[0].message);
				} else {
					setResponseMessage(err.response.data.message);
				}
			});
	};
	useEffect(() => {
		const query = {
			id: decoded.id,
		};
		Promise.all([API.getAPI("/user", headers, query), API.getAPI("/department", headers)]).then(
			([userResponse, departmentResponse]) => {
				const userData = userResponse.data;
				const departmentData = departmentResponse.data;
				setDepartment(departmentData);
				const departmentMap = {};
				departmentData.forEach((department) => {
					departmentMap[department.id] = department.name;
				});
				const customData = {
					"Full Name": userData.userInformation?.fullName ?? "",
					"User Name": userData.userName,
					Email: userData.userInformation?.email ?? "",
					"Phone Number": userData.userInformation?.phoneNumber ?? "",
					"Date of Birth": userData.userInformation?.dateOfBirth ?? "",
					Department: departmentMap[userData.departmentId],
				};
				setUserAvatar(userData.userInformation?.avatarPath);
				setData(customData);
				setInitialData(customData);
			}
		);
	}, [headers, decoded.id, decoded.departmentId]);
	return (
		<>
			<Box sx={{ mt: 2, border: "1px solid #7d7d7d", borderRadius: 3 }}>
				<Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
					<Typography variant="h3">Personal Information</Typography>
				</Box>
				<Grid container spacing={1} sx={{ alignItems: "center" }}>
					<Grid item xs={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<Container>
							<Box
								sx={{
									display: "flex",
									position: "relative",
									"&:hover": {
										cursor: "pointer",
										"& .account-box-icon": { opacity: 0.5 },
										"& .hover-content": { opacity: 1 },
									},
								}}>
								{userAvatar ? (
									<Box
										component="img"
										crossOrigin="anonymous"
										className="account-box-icon"
										alt="User Avatar"
										src={userAvatar}
										onClick={handleOpen}
										sx={{
											width: 200,
											height: 200,
											borderRadius: "10%",
											objectFit: "cover",
											cursor: "pointer",
										}}
									/>
								) : (
									<AccountBoxIcon
										className="account-box-icon"
										viewBox="3 3 18 18"
										onClick={handleOpen}
										sx={{ fontSize: 200 }}
									/>
								)}
								<Box
									className="hover-content"
									onClick={handleOpen}
									sx={{
										display: "flex",
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										alignItems: "center",
										opacity: 0,
									}}>
									<UploadIcon />
									<Typography variant="h6">Upload Avatar</Typography>
								</Box>
							</Box>
						</Container>
					</Grid>
					<Grid item xs={9}>
						<Container>
							<form>
								{fields.map((field) => (
									<Grid container spacing={2} sx={{ mb: 2 }} key={field}>
										<Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
											<InputLabel>{field}:</InputLabel>
										</Grid>
										<Grid item xs={9}>
											{field === "Department" && editMode ? (
												<FormControl size="small" fullWidth>
													<Select
														value={data ? data[field] : ""}
														onChange={(event) => {
															setData((prevData) => ({
																...prevData,
																[field]: event.target.value,
															}));
														}}
														fullWidth>
														{department.map((item) => (
															<MenuItem value={item.name} key={item.id}>
																{item.name}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											) : field === "Date of Birth" && editMode ? (
												<TextField
													type="date"
													value={data ? data["Date of Birth"] : ""}
													onChange={(event) => {
														setData((prevData) => ({
															...prevData,
															[field]: event.target.value,
														}));
													}}
													size="small"
													fullWidth
												/>
											) : (
												<TextField
													size="small"
													disabled={!editMode || field === "User Name"}
													fullWidth
													value={data ? data[field] : ""}
													onChange={(event) => {
														setData((prevData) => ({
															...prevData,
															[field]: event.target.value,
														}));
													}}></TextField>
											)}
										</Grid>
									</Grid>
								))}
							</form>
							<Box sx={{ height: 50, display: "flex", justifyContent: "center" }}>
								{editMode && (
									<Box>
										<Button variant="contained" color="success" sx={{ mr: 1 }} onClick={handleSave}>
											Save
										</Button>
										<Button variant="contained" color="error" sx={{ mr: 1 }} onClick={handleCancel}>
											Cancel
										</Button>
									</Box>
								)}
								<Box>
									<Button variant="contained" onClick={handleEdit} disabled={editMode}>
										Edit Profile
									</Button>
								</Box>
							</Box>
						</Container>
					</Grid>
				</Grid>
			</Box>
			<Modal
				open={open}
				onClose={handleClose}
				sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
				<Box
					sx={{
						borderRadius: 2,
						bgcolor: "white",
						boxShadow: 24,
						width: "400px",
						paddingX: 4,
						paddingBottom: 2,
						height: "270px",
						display: "flex",
						justifyContent: "center",
						flexDirection: "column",
					}}>
					<Box sx={{ display: "flex", justifyContent: "end" }}>
						<IconButton onClick={handleClose}>
							<CloseIcon />
						</IconButton>
					</Box>
					<Card
						elevation={0}
						sx={{
							borderRadius: 2,
							borderStyle: "dashed",
							borderWidth: "1px",
							width: "400px",
							height: "200px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}>
						{!selectedFile && (
							<Stack
								direction="column"
								sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
								<UploadIcon sx={{ fontSize: 48 }} />
								<Typography variant="h5">Upload picture to preview here</Typography>
							</Stack>
						)}
						{selectedFile && (
							<img
								src={URL.createObjectURL(selectedFile)}
								alt={selectedFile.name}
								style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
							/>
						)}
					</Card>
					<Box sx={{ mt: 1, display: "flex", justifyContent: "end" }}>
						{selectedFile && (
							<Button
								variant="contained"
								onClick={handleUpload}
								size="small"
								color="success"
								sx={{ mr: 1 }}>
								Upload
							</Button>
						)}
						<input
							accept="image/*"
							style={{ display: "none" }}
							id="raised-button-file"
							type="file"
							onChange={handleFileChange}
						/>
						<label htmlFor="raised-button-file">
							<Button size="small" variant="contained" component="span">
								Choose File
							</Button>
						</label>
					</Box>
				</Box>
			</Modal>
			<Popup.WarningPopup
				open={showWarning}
				handleClose={() => setShowWarning(false)}
				handleOk={handleAPI}
				message={"You confirm all information correct?"}
			/>
			<Popup.ErrorPopup
				open={showError}
				handleClose={() => setShowError(false)}
				statusCode={errorCode}
				message={responseMessage}
			/>
			<Popup.SuccessPopup
				open={showSuccess}
				handleClose={() => setShowSuccess(false)}
				message={responseMessage}
			/>
		</>
	);
};
export default UserProfile;