import { Request, Response, NextFunction } from 'express';
import Location, { LocationType, LocationStatus } from '../models/Location';

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude, address, locationType, description, status, capacity, reporterName } = req.body;

    const location = await Location.create({
      reporterName,
      latitude,
      longitude,
      address,
      locationType: locationType as LocationType,
      description,
      status: status as LocationStatus || LocationStatus.ACTIVE,
      capacity,
    });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status } = req.query;

    const query: any = {};
    if (type) {
      query.locationType = type as LocationType;
    }
    if (status) {
      query.status = status as LocationStatus;
    }

    const locations = await Location.find(query);

    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    }

    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};
