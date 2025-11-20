import { Request, Response, NextFunction } from 'express';
import Resource, { ResourceCategory, ResourceStatus } from '../models/Resource';
import ResourceRequest, { UrgencyLevel, RequestStatus } from '../models/ResourceRequest';
import Location, { LocationType } from '../models/Location';

export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      title, description, category, quantity, quantityUnit, contactInfo, 
      location, photoUrls, contactName, contactPhone 
    } = req.body;

    // Create location first
    const newLocation = await Location.create({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      locationType: LocationType.RESOURCE_POINT,
      reporterName: contactName,
    });

    const resource = await Resource.create({
      contactName,
      contactPhone,
      contactInfo,
      title,
      description,
      category: category as ResourceCategory,
      quantity: parseInt(quantity),
      quantityUnit,
      photoUrls: photoUrls || [],
      location: newLocation._id,
    });

    await resource.populate('location');

    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, status, search } = req.query;

    const query: any = {};
    if (category) {
      query.category = category as ResourceCategory;
    }
    if (status) {
      query.status = status as ResourceStatus;
    } else {
      query.status = ResourceStatus.AVAILABLE;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('location')
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
};

export const createResourceRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resourceId, description, quantity, urgency, category, contactName, contactPhone } = req.body;

    const request = await ResourceRequest.create({
      contactName,
      contactPhone,
      resource: resourceId,
      description,
      quantity: parseInt(quantity),
      urgency: urgency as UrgencyLevel || UrgencyLevel.NORMAL,
      category: category as ResourceCategory,
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};
