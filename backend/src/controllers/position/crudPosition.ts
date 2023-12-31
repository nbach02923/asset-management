import { NextFunction, Request, Response } from "express";
import AppDataSource from "../../../ormconfig";
import Position from "../../entities/Position";
async function createPosition(req: Request, res: Response, next: NextFunction) {
	try {
		const existingPosition = await AppDataSource.getRepository(Position).findOne({
			where: { name: req.body.name, isDeleted: false },
		});
		if (existingPosition) {
			return res.status(409).json({ message: "Work position already exist" });
		} else {
			const data = {
				name: req.body.name,
			};
			const position = await AppDataSource.getRepository(Position).create(data);
			const result = await AppDataSource.getRepository(Position).save(position);
			return res.status(201).json({ message: "Work position create successfully", result });
		}
	} catch (error) {
		return next(error);
	}
}

async function getPosition(_req: Request, res: Response, next: NextFunction) {
	try {
		const [position, positionTotal] = await AppDataSource.getRepository(Position).findAndCount({
			where: { isDeleted: false },
		});
		return res.status(200).json({ positionTotal, position });
	} catch (err) {
		return next(err);
	}
}
async function deletePosition(req: Request, res: Response, next: NextFunction) {
	try {
		const existingPosition = await AppDataSource.getRepository(Position).findOne({
			where: {
				code: req.params.positionCode,
				isDeleted: false,
			},
		});
		if (!existingPosition) {
			return res.status(404).json({ message: "Work position does not exist" });
		} else {
			await AppDataSource.createQueryBuilder()
				.update(Position)
				.set({
					isDeleted: true,
				})
				.where("id = :id", { id: req.params.positionCode })
				.execute();
			return res.status(204).send();
		}
	} catch (err) {
		return next(err);
	}
}
async function updatePosition(req: Request, res: Response, next: NextFunction) {
	try {
		const existingPosition = await AppDataSource.getRepository(Position).findOne({
			where: {
				code: req.params.positionCode,
				isDeleted: false,
			},
		});
		if (!existingPosition) {
			return res.status(404).json({ message: "Work position does not exist" });
		} else {
			const data = {
				name: req.body.name,
			};
			await AppDataSource.createQueryBuilder()
				.update(Position)
				.set(data)
				.where("code = :code", { code: req.params.positionCode })
				.execute();
			return res.status(200).json({ message: "Update work position successfully" });
		}
	} catch (error) {
		return next(error);
	}
}
const crudPosition = {
	createPosition,
	getPosition,
	deletePosition,
	updatePosition,
};
export default crudPosition;
