import { Request, Response, NextFunction } from 'express';
import MissingPerson, { Gender, PersonStatus } from '../models/MissingPerson';
import Location, { LocationType } from '../models/Location';

export const createMissingPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      fullName, age, gender, description, lastSeenDate, contactInfo, 
      reporterName, reporterPhone 
    } = req.body;

    let location = req.body.location;
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid location format' });
      }
    }

    const files = req.files as Express.Multer.File[];
    const photoUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];

    // Create location first
    const newLocation = await Location.create({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      province: location.province,
      district: location.district,
      ward: location.ward,
      street: location.street,
      locationType: LocationType.USER_LOCATION,
      reporterName: reporterName,
      photoUrls: photoUrls, // Add photos to location as well
    });

    const missingPerson = await MissingPerson.create({
      reporterName,
      reporterPhone,
      fullName,
      age,
      gender: gender as Gender,
      description,
      lastSeenDate: new Date(lastSeenDate),
      contactInfo,
      photoUrls: photoUrls,
      lastKnownLocation: newLocation._id,
    });

    // Populate location for response
    await missingPerson.populate('lastKnownLocation');

    res.status(201).json(missingPerson);
  } catch (error) {
    next(error);
  }
};

export const getMissingPersons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;

    const query: any = {};
    if (status) {
      query.status = status as PersonStatus;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const missingPersons = await MissingPerson.find(query)
      .populate('lastKnownLocation')
      .sort({ createdAt: -1 });

    res.status(200).json(missingPersons);
  } catch (error) {
    next(error);
  }
};

export const getMissingPersonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const missingPerson = await MissingPerson.findById(id)
      .populate('lastKnownLocation');

    if (!missingPerson) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo người mất tích' });
    }

    res.status(200).json(missingPerson);
  } catch (error) {
    next(error);
  }
};

export const updateMissingPersonStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, foundDate } = req.body;
    
    // In a real public app, we might want a secret key or admin check here
    // For now, we allow updates if they have the ID (simplified)

    const existingReport = await MissingPerson.findById(id);

    if (!existingReport) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }

    existingReport.status = status as PersonStatus;
    if (foundDate) {
      existingReport.foundDate = new Date(foundDate);
    }
    
    await existingReport.save();

    res.status(200).json(existingReport);
  } catch (error) {
    next(error);
  }
};

export const updateMissingPersonLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, address } = req.body;

    const missingPerson = await MissingPerson.findById(id);
    if (!missingPerson) {
      return res.status(404).json({ message: 'Missing person report not found' });
    }

    // Update the associated Location document
    if (missingPerson.lastKnownLocation) {
      await Location.findByIdAndUpdate(missingPerson.lastKnownLocation, {
        latitude,
        longitude,
        ...(address && { address }) // Update address if provided
      });
    }

    // Fetch updated document
    const updatedPerson = await MissingPerson.findById(id).populate('lastKnownLocation');
    res.status(200).json(updatedPerson);
  } catch (error) {
    next(error);
  }
};
