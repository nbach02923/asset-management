import CategoryAsset from "../../../src/entities/CategoryAsset";
import { Request, Response, NextFunction } from "express";
import AppDataSource from "../../../ormconfig";
async function getCategory(req: Request, res: Response, next: NextFunction) {
	try {
		let category;
		if (req.query.id) {
			const existCategory = await AppDataSource.getRepository(CategoryAsset).findOne({
				where: { id: req.query.id as string, isDeleted: false },
			});
			if (!existCategory) {
				return res.status(404).json({ message: "Danh mục không tồn tại" });
			} else {
				category = await AppDataSource.getRepository(CategoryAsset)
					.createQueryBuilder("category")
					.leftJoinAndSelect("category.asset", "asset")
					.select(["category.id as id", "category.name as name"])
					.addSelect("COUNT(asset.id)", "assetCount")
					.where("category.id = :id", { id: req.query.id })
					.groupBy("category.id")
					.getRawOne();
			}
		} else {
			category = await AppDataSource.getRepository(CategoryAsset)
				.createQueryBuilder("category")
				.leftJoinAndSelect("category.asset", "asset")
				.select(["category.id as id", "category.name as name"])
				.addSelect("COUNT(asset.id)", "assetCount")
				.where("category.isDeleted = :isDeleted", { isDeleted: false })
				.groupBy("category.id")
				.getRawMany();
		}
		return res.status(200).json(category);
	} catch (err) {
		return next(err);
	}
}

async function create(req: Request, res: Response, next: NextFunction) {
	try {
		const data = {
			name: req.body.name,
		};
		const category = await AppDataSource.getRepository(CategoryAsset).findOne({
			where: {
				name: req.body.name,
				isDeleted: false,
			},
		});
		if (category) {
			return res.status(409).json({ message: "Danh mục đã tồn tại" });
		} else {
			const categoryAsset = await AppDataSource.getRepository(CategoryAsset).create(data);
			const result = await AppDataSource.getRepository(CategoryAsset).save(categoryAsset);
			return res.json({
				message: "Thêm thành công danh mục tài sản",
				result,
			});
		}
	} catch (err) {
		return next(err);
	}
}

async function update(req: Request, res: Response, next: NextFunction) {
	try {
		const dataCatgoryAsset = {
			name: req.body.name,
		};

		const categoryAssetId = await AppDataSource.getRepository(CategoryAsset).findOne({
			where: { id: req.params.categoryId, isDeleted: false },
		});
		if (!categoryAssetId) {
			return res.status(404).json({ message: "Danh mục không tồn tại" });
		} else {
			const categoryAssetName = await AppDataSource.getRepository(CategoryAsset).findOne({
				where: { name: req.body.name, isDeleted: false },
			});
			if (categoryAssetName) {
				return res.status(409).json({ message: "Danh mục đã tồn tại" });
			} else {
				await AppDataSource.getRepository(CategoryAsset).update(
					{ id: req.params.categoryId },
					dataCatgoryAsset
				);
				return res.status(200).json({
					message: "Sửa danh mục tài sản thành công",
				});
			}
		}
	} catch (err) {
		return next(err);
	}
}

async function deleteCategoryAsset(req: Request, res: Response, next: NextFunction) {
	try {
		const categoryAsset = await AppDataSource.getRepository(CategoryAsset).findOne({
			where: {
				id: req.params.categoryId, isDeleted: false
			},
		});
		if (!categoryAsset) {
			return res.status(404).json({ message: "Danh mục không tồn tại" });
		} else {
			await AppDataSource.createQueryBuilder()
				.update(CategoryAsset)
				.set({
					isDeleted: true,
				})
				.where("id = :id", { id: req.params.categoryId })
				.execute();
			return res.status(204).send();
		}
	} catch (err) {
		return next(err);
	}
}

const crudCategoryAsset = { create, update, deleteCategoryAsset, getCategory };
export default crudCategoryAsset;
