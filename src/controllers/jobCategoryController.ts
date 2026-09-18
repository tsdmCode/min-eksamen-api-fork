import { prisma } from '../lib/prisma';
import { Request, Response } from 'express';
import { parseId } from '../utils/parseId';
import { AppError } from '../utils/AppError';

export class JobCategoryController {
  getAllJobCategories = async (req: Request, res: Response) => {
    const items = await prisma.jobCategory.findMany();
    res.status(200).json(items);
  };

  //her har jeg lavet en function der tæller alle jobsne sammen for hver kategori og returner dem så jeg ikke skal lave en milliard fetches
  getAllJobCategoriesCounts = async (req: Request, res: Response) => {
    const items = await prisma.jobCategory.findMany({
      include: {
        _count: { select: { jobListings: true } },
      },
    });

    const results = items.map(({ _count, ...category }) => ({
      ...category,
      jobCount: _count.jobListings,
    }));

    return res.status(200).json(results);
  };

  getJobCategoryById = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) throw new AppError(400, 'Invalid job category ID');

    const item = await prisma.jobCategory.findUnique({
      where: { id },
      include: {
        jobListings: {
          include: {
            region: true,
            workType: true,
            jobCategory: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                zipcode: true,
              },
            },
          },
        },
      },
    });
    if (!item) throw new AppError(404, 'Job category not found');
    res.status(200).json(item);
  };

  createJobCategory = async (req: Request, res: Response) => {
    const data = { ...req.body };
    const item = await prisma.jobCategory.create({ data });
    res.status(201).json(item);
  };
}

export const jobCategoryController = new JobCategoryController();
