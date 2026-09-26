import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schemas";

export function listCategories() {
  return prisma.productCategory.findMany({
    include: { parent: { select: { id: true, name: true } }, _count: { select: { products: true, children: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getCategory(id: string) {
  const category = await prisma.productCategory.findUnique({
    where: { id },
    include: { parent: { select: { id: true, name: true } }, children: true },
  });
  if (!category) throw AppError.notFound("Category not found");
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  if (input.parentId) {
    const parent = await prisma.productCategory.findUnique({ where: { id: input.parentId } });
    if (!parent) throw AppError.badRequest("Parent category does not exist", { parentId: "Not found" });
  }
  return prisma.productCategory.create({ data: { name: input.name, parentId: input.parentId ?? null } });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategory(id);
  if (input.parentId === id) {
    throw AppError.badRequest("A category cannot be its own parent", { parentId: "Invalid parent" });
  }
  if (input.parentId) {
    const parent = await prisma.productCategory.findUnique({ where: { id: input.parentId } });
    if (!parent) throw AppError.badRequest("Parent category does not exist", { parentId: "Not found" });
  }
  return prisma.productCategory.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  const category = await prisma.productCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  });
  if (!category) throw AppError.notFound("Category not found");
  if (category._count.products > 0 || category._count.children > 0) {
    throw AppError.conflict("Cannot delete a category that has products or sub-categories");
  }
  await prisma.productCategory.delete({ where: { id } });
}
