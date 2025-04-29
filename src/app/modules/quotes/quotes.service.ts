/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { createMessage } from '../../utils/message';
import Customer from '../customer/customer.model';
import HireRequest from '../hireRequest/hireRequest.model';
import { sendNotification } from '../notification/notification.utils';
import Service from '../services/service.model';
import { quotesSearchabFields, QuotestatusEnum } from './quotes.constant';
import { IQuotes } from './quotes.interface';
import { Quotes } from './quotes.model';

const insertQuotesintoDb = async (payload: IQuotes) => {
  // Create a new quote
  const result = await Quotes.create(payload);

  //

  // Fetch the FCM token
  const customerData = await Customer.findById(result.customer)
    .select('fcmToken')
    .lean();

  // Construct the notification message
  const message = {
    title: 'New Quote',
    body: 'A new quote has been provided. Please check the dashboard for details.',
    data: {
      receiver: result.customer,
      type: 'quote',
    },
  };

  // Send notification and update hire request concurrently
  await Promise.all([
    sendNotification([customerData?.fcmToken as string], message),
    HireRequest.updateOne(
      { _id: payload.request },
      { $set: { status: 'quote_sent', isDeleted: true } },
    ),
  ]);

  return result;
};

const getProviderWiseQuotes = async (query: Record<string, any>) => {
  const { searchTerm, shop, page: pages, ...others } = query;
  const andCondition: any[] = [];

  // Add searchTerm condition
  if (searchTerm) {
    andCondition.push({
      $or: quotesSearchabFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Add other filters
  if (Object.keys(others).length) {
    andCondition.push({
      $and: Object.entries(others).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Add the isDeleted condition
  andCondition.push({
    isDeleted: false,
  });

  const page = query.page ? parseInt(query.page) : 1;
  const limit = query.limit ? parseInt(query.limit) : 10;
  const skip = (page - 1) * limit;

  const WhereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  const pipeline: any[] = [
    {
      $match: WhereCondition, // Apply filter conditions
    },
    {
      $lookup: {
        from: 'services', // Lookup in 'Service' collection
        let: { serviceId: '$service' }, // Reference service ID from quotes
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$serviceId'], // Match the service
              },
            },
          },
          ...(shop
            ? [
                {
                  $lookup: {
                    from: 'shops', // Lookup in 'Shop' collection
                    let: { shopId: '$shop' }, // Reference shop ID from service
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$_id', '$$shopId'], // Match shop ID
                          },
                        },
                      },
                    ],
                    as: 'shopDetails', // Get shop details
                  },
                },
                { $unwind: '$shopDetails' }, // Unwind shop details array
                {
                  $match: {
                    'shopDetails._id': new mongoose.Types.ObjectId(shop), // Match provided shop ID
                  },
                },
              ]
            : []), // Only apply shop match if shop ID is provided
        ],
        as: 'serviceDetails', // Get service details
      },
    },
    { $unwind: '$serviceDetails' }, // Unwind service details array

    {
      $lookup: {
        from: 'categories', // Lookup in 'customers' collection
        localField: 'serviceDetails.category', // Reference customer field from quotes
        foreignField: '_id', // Match customer by ID
        as: 'categoryDetails', // Get customer details
      },
    },
    {
      $unwind: {
        path: '$categoryDetails',
        preserveNullAndEmptyArrays: true, // Optional: to handle cases where there are no matches
      },
    },

    // Populate customer field and select name, location, and address fields
    {
      $lookup: {
        from: 'customers', // Lookup in 'customers' collection
        localField: 'customer', // Reference customer field from quotes
        foreignField: '_id', // Match customer by ID
        as: 'customerDetails', // Get customer details
      },
    },
    {
      $unwind: {
        path: '$customerDetails',
        preserveNullAndEmptyArrays: true, // Optional: to handle cases where there are no matches
      },
    },
    {
      $lookup: {
        from: 'users', // Lookup in 'User' collection
        localField: 'customerDetails.user', // Reference user field from customerDetails
        foreignField: '_id', // Match user by ID
        as: 'userDetails', // Get user details
      },
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true, // Ensure the array is unwound even if null or empty
      },
    },
    {
      $lookup: {
        from: 'users', // Lookup in 'User' collection
        localField: 'customerDetails.user', // Reference user field from customerDetails
        foreignField: '_id', // Match user by ID
        as: 'userDetails', // Get user details
      },
    },
    {
      $lookup: {
        from: 'employees', // Lookup in 'User' collection
        localField: 'employee', // Reference user field from customerDetails
        foreignField: '_id', // Match user by ID
        as: 'employeeDetails', // Get user details
      },
    },
    {
      $unwind: {
        path: '$employeeDetails',
        preserveNullAndEmptyArrays: true, // Ensure the array is unwound even if null or empty
      },
    },
    {
      $lookup: {
        from: 'users', // Lookup in 'User' collection
        localField: 'employeeDetails.user', // Reference user field from customerDetails
        foreignField: '_id', // Match user by ID
        as: 'employeeUser', // Get user details
      },
    },
    {
      $unwind: {
        path: '$employeeUser',
        preserveNullAndEmptyArrays: true, // Ensure the array is unwound even if null or empty
      },
    },

    // Project the necessary fields
    {
      $project: {
        customer: {
          name: '$customerDetails.name',
          location: '$customerDetails.location',
          address: '$customerDetails.address',
          image: '$customerDetails.image',
          phone: {
            countryCode: {
              $cond: {
                if: { $isArray: '$userDetails.countryCode' },
                then: { $arrayElemAt: ['$userDetails.countryCode', 0] },
                else: '$userDetails.countryCode', // Use it directly if it's not an array
              },
            },
            number: {
              $cond: {
                if: { $isArray: '$userDetails.phoneNumber' },
                then: { $arrayElemAt: ['$userDetails.phoneNumber', 0] },
                else: '$userDetails.phoneNumber', // Use it directly if it's not an array
              },
            },
          },
        },
        employee: {
          name: '$employeeDetails.name',
          phone: {
            countryCode: {
              $cond: {
                if: { $isArray: '$employeeUser.countryCode' },
                then: { $arrayElemAt: ['$employeeUser.countryCode', 0] },
                else: '$employeeUser.countryCode', // Use it directly if it's not an array
              },
            },
            number: {
              $cond: {
                if: { $isArray: '$employeeUser.phoneNumber' },
                then: { $arrayElemAt: ['$employeeUser.phoneNumber', 0] },
                else: '$employeeUser.phoneNumber', // Use it directly if it's not an array
              },
            },
          },
          image: '$employeeDetails.image',
        },
        category: '$categoryDetails.title',
        image: '$categoryDetails.image.url',
        service: '$serviceDetails._id',
        fee: 1,
        date: 1,
        status: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },

    {
      $facet: {
        total: [{ $count: 'total' }], // Count total records
        data: [
          { $skip: skip }, // Pagination skip
          { $limit: limit }, // Pagination limit
        ],
      },
    },
  ];

  const result = await Quotes.aggregate(pipeline);

  const total = result[0]?.total[0]?.total || 0; // Get the total count
  const quotes = result[0]?.data || []; // Get paginated quotes

  const totalPage = Math.ceil(total / limit);

  return {
    data: quotes,
    meta: {
      total,
      page,
      limit,
      totalPage,
    },
  };
};

const getAllQuotes = async (query: Record<string, any>) => {
  const QuoteModel = new QueryBuilder(
    Quotes.find()
      .populate({
        path: 'request', // Populate the service field
        select: 'description images priority rejectionReason',
      })
      .populate({
        path: 'service', // Populate the service field
        populate: [
          {
            path: 'shop',
            select: 'name address helpLineNumber',
          },
          {
            path: 'category',
            select: 'title',
          },
        ],
      })

      .populate({
        path: 'employee', // Populate the employee field
        select: 'name image', // Select only the name and image fields
        populate: {
          path: 'user', // Nested populate for user field in employee
          select: 'countryCode phoneNumber', // Select countryCode and phoneNumber from user
        },
      }),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .fields()
    .sort();

  const data = await QuoteModel.modelQuery;
  const meta = await QuoteModel.countTotal();

  return {
    data,
    meta,
  };
};

const getSingleQuotes = async (id: string) => {
  const result = await Quotes.findById(id)
    .populate({
      path: 'request', // Populate the service field
      select: 'description images priority rejectionReason',
    })
    .populate({
      path: 'service',
      populate: {
        path: 'category', // Populate category inside service
        select: 'title', // Select title field from category
      },
    })
    .populate({
      path: 'customer', // Populate customer directly from quotes
      select: 'name address location', // Select name, address, and location from customer
      populate: {
        path: 'user', // Populate user inside customer
        select: 'countryCode phoneNumber', // Select countryCode and phoneNumber from user
      },
    });

  return result;
};

const updateQuotes = async (id: string, payload: Partial<IQuotes>) => {
  const result = await Quotes.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

// accept quote
const acceptQuote = async (id: string) => {
  const result = await Quotes.findByIdAndUpdate(
    id,
    { $set: { status: 'accepted' } },
    { new: true },
  );

  // Fetch the service with nested population in one query
  const findService: any = await Service.findById(result?.service)
    .select('_id')
    .populate({
      path: 'shop',
      select: 'provider',
      populate: {
        path: 'provider',
        select: 'fcmToken',
      },
    })
    .lean(); // Use lean for faster, plain JavaScript object result

  const fcmToken = findService?.shop?.provider?.fcmToken;
  console.log(fcmToken);
  // Create and send the notification
  const message = createMessage(
    'Quote Accepted',
    'Customer has accepted your quote request. Please check the dashboard for details.',
    { receiver: findService?.shop?.provider?._id, type: 'quote' },
  );
  console.log(message);
  await sendNotification([fcmToken], message);

  return result;
};

// reject quote
const rejectQuote = async (id: string, body: any) => {
  const result = await Quotes.findByIdAndUpdate(
    id,
    { $set: { status: 'rejected', rejectionReason: body.rejectionReason } },
    { new: true },
  );
  return result;
};
// reject quote
const cancelledQuote = async (id: string) => {
  const result = await Quotes.findByIdAndUpdate(
    id,
    { $set: { status: 'canceled' } },
    { new: true },
  );
  return result;
};

const getQuotesStatusSummary = async (query: Record<string, any>) => {
  const { shop } = query;

  const pipeline: any[] = [
    {
      $match: {
        isDeleted: false, // Ensure we only consider non-deleted quotes
      },
    },
    {
      $lookup: {
        from: 'services', // Lookup in 'services' collection
        let: { serviceId: '$service' }, // Use service field from quotes
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$serviceId'], // Match the service by ID
              },
            },
          },
          {
            $lookup: {
              from: 'shops', // Lookup in 'shops' collection
              let: { shopId: '$shop' }, // Use shop field from services
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', new mongoose.Types.ObjectId(shop)], // Match the shop ID passed in the query
                    },
                  },
                },
              ],
              as: 'shopDetails', // Get shop details from the lookup
            },
          },
          { $unwind: '$shopDetails' }, // Unwind the shop details array
        ],
        as: 'serviceDetails', // Attach service details to the quote
      },
    },
    { $unwind: '$serviceDetails' }, // Unwind the service details array to access the service fields
    {
      $group: {
        _id: '$status', // Group by the status field
        count: { $sum: 1 }, // Count the number of quotes for each status
      },
    },
    {
      $project: {
        _id: 0, // Do not include the `_id` field
        status: '$_id', // Rename `_id` to `status`
        count: 1, // Include the count field
      },
    },
  ];

  const result = await Quotes.aggregate(pipeline);

  // Initialize counts for each status
  const statusSummary = {
    totalPending: 0,
    totalCompleted: 0,
    totalAccepted: 0,
  };

  // Map the results to the appropriate fields
  result.forEach((statusData) => {
    if (statusData.status === 'pending') {
      statusSummary.totalPending = statusData.count;
    } else if (statusData.status === 'completed') {
      statusSummary.totalCompleted = statusData.count;
    } else if (statusData.status === 'accepted') {
      statusSummary.totalAccepted = statusData.count;
    }
  });

  return statusSummary;
};

// accetpcompletation offer

const acceptCompletationRequest = async (payload: any) => {
  console.log(payload);
  // that need to be updated later
  // const findQuote = await Quotes.findById(payload?.quote).select('customer');
  // if (findQuote?.customer.toString() !== payload?.customer) {
  //   throw new AppError(
  //     httpStatus.NOT_ACCEPTABLE,
  //     'You are not a valid customer to scan the QR code.',
  //   );
  // }
  const result = await Quotes.findByIdAndUpdate(
    payload?.quote,
    // it should be iscustomer accept
    { isProviderAccept: true, status: QuotestatusEnum.COMPLETED },
    { new: true },
  );
  return result;
};

const openPaymentPopup = async () => {
  return {};
};
const completeQuote = async (id: string, body: any) => {
  const result = await Quotes.findByIdAndUpdate(
    id,
    { $set: { status: QuotestatusEnum.COMPLETED } },
    { new: true },
  );

  return result;
};
export const quotesServices = {
  insertQuotesintoDb,
  getAllQuotes,
  getProviderWiseQuotes,
  getSingleQuotes,
  updateQuotes,
  acceptQuote,
  rejectQuote,
  cancelledQuote,
  acceptCompletationRequest,
  getQuotesStatusSummary,
  openPaymentPopup,
  completeQuote,
};
