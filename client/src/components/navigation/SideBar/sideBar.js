import React, { useState } from "react";
import { Collapse, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, IconButton } from "@mui/material";
import listItems from "../../../utils/listItems.json";
import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import logo from "../../../logo.svg";
import decodeJWT from "../../../utils/decodeJWT";

const SideBar = ({ open, setOpen }) => {
	const userRole = decodeJWT().role;
	const filteredListItems = listItems.filter((item) => {
		if (userRole) {
			return true;
		} else {
			return !["Registration Management", "Statistics", "System Management"].includes(item.text);
		}
	});
	const [openItems, setOpenItems] = useState({});
	const handleOpenItem = (item) => {
		setOpenItems((prevOpenItems) => ({
			...prevOpenItems,
			[item]: !prevOpenItems[item],
		}));
	};
	const handleClose = () => {
		setOpen(false);
		setOpenItems({});
	};
	const icons = {
		HomeIcon: <HomeIcon />,
		ManageAccountsIcon: <ManageAccountsIcon />,
		FormatListBulletedIcon: <FormatListBulletedIcon />,
		NoteAltIcon: <NoteAltIcon />,
		QueryStatsIcon: <QueryStatsIcon />,
		SettingsApplicationsIcon: <SettingsApplicationsIcon />,
	};
	return (
		<Drawer open={open} onClose={handleClose} PaperProps={{ sx: { bgcolor: "#010d8a", width: "290px" } }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", p: 2, alignItems: "center" }}>
				<IconButton onClick={handleClose}>
					<CloseIcon sx={{ color: "white", float: "right" }} />
				</IconButton>
				<Box>
					<img src={logo} width="100px" alt="logo" />
				</Box>
			</Box>
			<List>
				{filteredListItems.map((item) => (
					<React.Fragment key={item.index}>
						<ListItemButton
							component={Link}
							to={item.route}
							onClick={() => {
								handleOpenItem(item.text);
								if (item.route) {
									handleClose();
								}
							}}>
							<ListItemIcon sx={{ color: "white", marginRight: "-16px" }}>
								{icons[item.icon]}
							</ListItemIcon>
							<ListItemText primary={item.text} sx={{ color: "white" }} />
							{item.children ? (
								openItems[item.text] ? (
									<ExpandLess sx={{ color: "white" }} />
								) : (
									<ExpandMore sx={{ color: "white" }} />
								)
							) : null}
						</ListItemButton>
						{item.children && (
							<Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
								<List component="div">
									{item.children.map((child) => (
										<ListItemButton
											key={child.index}
											component={Link}
											to={child.route}
											onClick={handleClose}>
											<ListItemText primary={child.text} sx={{ color: "white" }} />
										</ListItemButton>
									))}
								</List>
							</Collapse>
						)}
					</React.Fragment>
				))}
			</List>
		</Drawer>
	);
};
export default SideBar;
