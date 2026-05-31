const Product = require('../models/Product');
let cachedToken = null;
let tokenExpiresAt = null;

const cleanText = (val) => {
  if (!val) return '';
  let str = String(val).trim();
  
  const stripQuotes = (s) => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).trim();
    }
    return s;
  };

  let prev;
  do {
    prev = str;
    str = stripQuotes(str);
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          str = String(parsed[0]).trim();
        }
      } catch (e) {
        try {
          const formatted = str
            .replace(/'/g, '"')
            .replace(/\\"/g, '"');
          const parsed = JSON.parse(formatted);
          if (Array.isArray(parsed) && parsed.length > 0) {
            str = String(parsed[0]).trim();
          }
        } catch (err) {
          // ignore
        }
      }
    }
  } while (str !== prev);

  return str;
};

const sanitizeUrl = (url) => {
  if (!url) return url;
  const cleanUrl = cleanText(url);
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }
  return cleanUrl;
};

const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // ignore
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [val];
};

/**
 * Get CJ Dropshipping access token using the configured API Key.
 */
const getAccessToken = async (retries = 1) => {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey || apiKey === 'cj_mock_api_key_for_testing') {
    return null; // Force mock mode
  }

  // Check if token is still valid (reserve 5 minutes window)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const data = await response.json();

    if (data && data.code === 200 && data.data) {
      cachedToken = data.data.accessToken;
      const expiryDays = data.data.accessTokenExpiryDate || 180;
      tokenExpiresAt = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
      return cachedToken;
    } else if (data?.message?.includes('Too Many Requests') && retries > 0) {
      console.warn('CJ Auth Rate Limited. Waiting 1.5s to retry...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return getAccessToken(retries - 1);
    } else {
      console.warn('CJ Dropshipping Auth returned error:', data?.message || 'Unknown error');
      throw new Error(`Auth failed: ${data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('CJ Dropshipping Token retrieval failed:', error.message);
    throw error;
  }
};

/**
 * Query videos associated with a product ID from CJ Dropshipping.
 */
const getProductVideos = async (productId, token) => {
  if (!token || !productId) return [];
  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/product/queryVideosByProductId', {
      method: 'POST',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    const data = await response.json();
    if (data && (data.code === 200 || data.success) && data.data) {
      let list = [];
      if (Array.isArray(data.data)) {
        list = data.data;
      } else if (data.data.videos && Array.isArray(data.data.videos)) {
        list = data.data.videos;
      } else if (typeof data.data === 'object') {
        if (data.data.videoUrl) {
          list = [data.data];
        }
      }

      const urls = list.map(item => {
        if (typeof item === 'string') return sanitizeUrl(item);
        if (item && item.videoUrl) return sanitizeUrl(item.videoUrl);
        return null;
      }).filter(Boolean);
      return urls;
    }
    return [];
  } catch (error) {
    console.error('CJ queryVideosByProductId failed:', error.message);
    return [];
  }
};

const getProductDetails = async (cjProductId) => {
  const token = await getAccessToken();

  if (!token) {
    console.log(`CJ Dropshipping: Mocking product details lookup for ID: ${cjProductId}`);
    return {
      pid: cjProductId,
      productName: `CJ Premium Smart Watch ${cjProductId.slice(-4).toUpperCase()}`,
      productNameEn: `CJ Premium Smart Watch ${cjProductId.slice(-4).toUpperCase()}`,
      productImage: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwfb265315/images/Titan/Catalog/1825KM01_1.jpg?sw=360&sh=360",
      description: "Experience premium grade features with smart activity tracking, luxury design, AMOLED screen, and multi-sport mode. Perfect for daily routines and fitness monitoring.",
      categoryName: "Electronics",
      productGallery: [
        "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwfb265315/images/Titan/Catalog/1825KM01_1.jpg?sw=360&sh=360",
        "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwfb265315/images/Titan/Catalog/1825KM01_2.jpg?sw=360&sh=360"
      ],
      productVideo: [
        "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-wearing-a-smartwatch-close-up-43033-large.mp4"
      ],
      variants: [
        {
          vid: `VID_${cjProductId}_1`,
          variantKey: "Black-Large",
          variantSku: `SKU-${cjProductId}-BLK-L`,
          color: "Black",
          size: "Large",
          variantSellPrice: 15.99,
          variantPrice: 1200,
          stock: 120,
          variantImage: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwfb265315/images/Titan/Catalog/1825KM01_1.jpg?sw=360&sh=360"
        },
        {
          vid: `VID_${cjProductId}_2`,
          variantKey: "Silver-Medium",
          variantSku: `SKU-${cjProductId}-SLV-M`,
          color: "Silver",
          size: "Medium",
          variantSellPrice: 13.99,
          variantPrice: 1000,
          stock: 85,
          variantImage: "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dwfb265315/images/Titan/Catalog/1825KM01_2.jpg?sw=360&sh=360"
        }
      ]
    };
  }

  let cleanId = cjProductId.trim();
  // Auto-extract PID if a full CJ product URL is pasted
  if (cleanId.includes('http://') || cleanId.includes('https://') || cleanId.includes('cjdropshipping.com')) {
    const pMatch = cleanId.match(/-p-([A-Za-z0-9\-]+)/);
    const idMatch = cleanId.match(/[?&]id=([A-Za-z0-9\-]+)/);
    if (pMatch && pMatch[1]) {
      cleanId = pMatch[1];
    } else if (idMatch && idMatch[1]) {
      cleanId = idMatch[1];
    }
  }

  try {
    let queryParam = '';
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanId);
    const isNumeric = /^\d+$/.test(cleanId);

    if (isUuid || isNumeric) {
      queryParam = `pid=${cleanId}`;
    } else if (cleanId.includes('-')) {
      queryParam = `variantSku=${cleanId}`;
    } else if (cleanId.startsWith('CJ') || /^[A-Za-z]/.test(cleanId)) {
      queryParam = `productSku=${cleanId}`;
    } else {
      queryParam = `pid=${cleanId}`;
    }

    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?${queryParam}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token
      }
    });

    const data = await response.json();

    if (data && (data.code === 200 || data.success)) {
      const details = data.data;
      if (details) {
        if (details.productName) {
          details.productName = cleanText(details.productName);
        }
        if (details.productNameEn) {
          details.productNameEn = cleanText(details.productNameEn);
        }
        if (details.productImage) {
          details.productImage = sanitizeUrl(details.productImage);
        }
        if (details.productGallery) {
          const parsedGallery = parseArray(details.productGallery);
          details.productGallery = parsedGallery.map(sanitizeUrl).filter(Boolean);
        } else {
          details.productGallery = [];
        }
        if (details.productVideo) {
          const parsedVideo = parseArray(details.productVideo);
          details.productVideo = parsedVideo.map(sanitizeUrl).filter(Boolean);
        } else if (details.videoUrl) {
          details.productVideo = [sanitizeUrl(details.videoUrl)];
        } else {
          details.productVideo = [];
        }

        // If no video URL was found in details query, search using the dedicated queryVideosByProductId API
        if (details.productVideo.length === 0 && details.pid) {
          const fetchedVideos = await getProductVideos(details.pid, token);
          if (fetchedVideos && fetchedVideos.length > 0) {
            details.productVideo = fetchedVideos;
          }
        }
        if (details.variants && Array.isArray(details.variants)) {
          details.variants = details.variants.map(v => {
            if (v.variantImage) {
              v.variantImage = sanitizeUrl(v.variantImage);
            }
            return v;
          });
        }
      }
      return details;
    } else {
      throw new Error(data?.message || 'CJ product detail lookup failed');
    }
  } catch (error) {
    console.error('CJ Dropshipping Product Details API failed:', error.message);
    throw new Error(`Supplier API Error: ${error.message}`);
  }
};

/**
 * Forward order details to CJ Dropshipping.
 * If credentials are mock, returns a mock success status.
 */
const createCJOrder = async (order) => {
  let token;
  try {
    token = await getAccessToken();
  } catch (error) {
    throw new Error(`Failed to authenticate with CJ Dropshipping: ${error.message}`);
  }

  if (!token) {
    console.log('CJ Dropshipping: Operating in MOCK mode (No valid CJ_API_KEY configured).');
    return {
      success: true,
      cjOrderId: `CJ_MOCK_${order._id.toString().slice(-6).toUpperCase()}`,
      message: 'Successfully generated mock CJ Dropshipping order identifier.'
    };
  }

  try {
    const products = [];
    for (const item of order.items) {
      let finalVid = item.variantSku || item.product.toString();
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(finalVid);
      
      // Resolve if it's a MongoDB ID, or an SKU instead of a proper CJ Variant ID
      if (isMongoId || (finalVid && !finalVid.startsWith('VID_') && !/^[0-9a-fA-F\-]{36}$/.test(finalVid))) {
        try {
          const dbProduct = await Product.findById(item.product);
          console.log(`[CJ Sync] Resolving VID for DB Product ID: ${item.product}, Supplier PID: ${dbProduct?.supplierProductId}`);
          if (dbProduct && dbProduct.supplierProductId) {
             const cjDetails = await getProductDetails(dbProduct.supplierProductId);
             if (cjDetails && cjDetails.variants) {
               let matchingVariant = null;
               if (item.variantSku) {
                 matchingVariant = cjDetails.variants.find(v => v.variantSku === item.variantSku || v.vid === item.variantSku);
               } else if (cjDetails.variants.length > 0) {
                 matchingVariant = cjDetails.variants[0];
               }
               
               if (matchingVariant && matchingVariant.vid) {
                 finalVid = matchingVariant.vid;
                 console.log(`[CJ Sync] Successfully mapped to CJ VID: ${finalVid}`);
               } else {
                 console.log(`[CJ Sync] Could not find matching variant in CJ details. Variants available:`, cjDetails.variants.map(v => v.vid));
               }
             }
          }
        } catch (err) {
          console.error("[CJ Sync] Error resolving true CJ vid:", err.message);
        }
      }
      
      products.push({
        vid: finalVid,
        quantity: item.quantity
      });
    }

    const shippingAddress = order.shippingAddress;

    // Map country name to ISO code
    const countryCodeMap = {
      'india': 'IN',
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'canada': 'CA',
      'australia': 'AU',
      'germany': 'DE',
      'france': 'FR',
      'uae': 'AE',
      'united arab emirates': 'AE',
      'singapore': 'SG',
      'malaysia': 'MY',
    };
    const countryName = (shippingAddress.country || 'India').trim();
    const countryCode = countryCodeMap[countryName.toLowerCase()] || 'IN';

    const payload = {
      orderNumber: order._id.toString(),
      shippingCustomerName: (
        (order.user && typeof order.user === 'object' && order.user.name)
          ? order.user.name
          : (order.shippingAddress?.name || 'Customer')
      ).trim() || 'Customer',
      shippingAddress: shippingAddress.street,
      shippingCity: shippingAddress.city,
      shippingProvince: shippingAddress.state,
      shippingZip: shippingAddress.pincode,
      shippingCountry: countryName,
      shippingCountryCode: countryCode,
      shippingPhone: (
        (order.user && typeof order.user === 'object' && order.user.phone)
          ? order.user.phone
          : '9999999999'
      ).replace(/\D/g, '').slice(0, 15) || '9999999999',
      fromCountryCode: 'CN',        // CJ ships from China warehouses
      shopLogisticsType: 0,          // 0 = auto-select best logistics
      payType: 3,                    // 3 = create order only, no payment deduction
      logisticName: 'CJPacket',      // Provide fallback explicitly if auto-select fails
      products: products
    };

    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
      method: 'POST',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data && (data.code === 200 || data.success)) {
      return {
        success: true,
        cjOrderId: data.data?.cjOrderId || data.data?.orderId,
        message: 'Fulfillment order successfully synchronized with CJ Dropshipping portal.'
      };
    } else {
      throw new Error(data?.message || 'Fulfillment order creation failed on supplier site');
    }
  } catch (error) {
    console.error('CJ Dropshipping Order Creation API failed:', error.message);
    throw new Error(`Supplier API Error: ${error.message}`);
  }
};

/**
 * Query shipping tracking information from CJ.
 */
const getTrackingNumber = async (cjOrderId) => {
  const token = await getAccessToken();

  if (!token) {
    console.log(`CJ Dropshipping: Mocking tracking lookup for order: ${cjOrderId}`);
    return {
      trackingNumber: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
      carrier: "Delhivery",
      status: "shipped"
    };
  }

  try {
    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getTrackingNumber?cjOrderId=${cjOrderId}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token
      }
    });

    const data = await response.json();

    if (data && (data.code === 200 || data.success)) {
      return {
        trackingNumber: data.data?.trackingNumber,
        carrier: data.data?.logisticName || "Delhivery",
        status: data.data?.trackingNumber ? "shipped" : "processing"
      };
    } else if (data?.message === 'Interface not found') {
      // Handle incorrect API route gracefully without crashing the sync loop
      return {
        trackingNumber: null,
        carrier: "Pending",
        status: "processing"
      };
    } else {
      throw new Error(data?.message || 'CJ tracking lookup failed');
    }
  } catch (error) {
    console.error('CJ Dropshipping Tracking API failed:', error.message);
    throw new Error(`Supplier Tracking API Error: ${error.message}`);
  }
};

module.exports = {
  createCJOrder,
  getProductDetails,
  getTrackingNumber,
  getProductVideos,
  getAccessToken
};
