import { Container } from "@mui/material";
import React from "react";
import DataTable from "../../components/dataTable";
import useAllocationState from "./useAllocationState";
import ModalComponent from "../../components/modal";

const Allocation = () => {
	const {
		data,
		tableHeader,
		handleEdit,
		open,
		handleClose,
		title,
		fields,
		handleAPI,
		shouldRenderEditButton,
		total,
		currentPage,
		setCurrentPage,
	} = useAllocationState();
	return (
		<Container>
			<DataTable
				title="Allocation Request Table"
				data={data}
				headers={tableHeader}
				handleActionOnClick={{
					edit: handleEdit,
				}}
				shouldRenderEditButton={shouldRenderEditButton}
				total={total}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
			<ModalComponent open={open} handleClose={handleClose} title={title} fields={fields} handleAPI={handleAPI} />
		</Container>
	);
};
export default Allocation;
