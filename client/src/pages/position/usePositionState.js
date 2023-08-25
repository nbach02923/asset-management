import { useState, useEffect, useMemo } from "react";
import API from "../../services/request";
export default function usePositionState() {
	const [data, setData] = useState([]);
	const [tableHeader, setTableHeader] = useState([]);
	const headers = useMemo(() => {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("token")}`,
			Accept: "application/json",
		};
	}, []);
	useEffect(() => {
		const querys = {
			limit: 1000,
		};
		API.getAPI("/position", headers, querys).then((response) => {
			const position = response.data;
			const customHeaders = ["Position Name"];
			setTableHeader(customHeaders);
			const customData = position.map((item) => {
				return {
					code: item.code,
					name: item.name,
				};
			});
			setData(customData);
		});
	}, [headers]);
	return { data, tableHeader };
}
