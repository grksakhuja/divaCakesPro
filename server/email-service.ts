import nodemailer from 'nodemailer';
import { CakeOrder, OrderItem } from '@shared/schema';
import { storage } from './storage';

// Create reusable transporter object using Brevo SMTP relay
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER, // Brevo SMTP login (email)
    pass: process.env.BREVO_SMTP_PASS, // Brevo SMTP password
  },
});

// Admin email template
const createAdminEmailTemplate = async (order: CakeOrder) => {
  const totalPrice = (order.totalPrice / 100).toFixed(2);
  const orderDate = new Date(order.orderDate).toLocaleDateString();
  
  // Check if this is a multi-item order
  let orderItemsHtml = '';
  if (order.hasLineItems) {
    try {
      const orderItems = await storage.getOrderItemsByOrderId(order.id);
      if (orderItems && orderItems.length > 0) {
        // Organize items by type for better presentation
        const customCakes = orderItems.filter(item => item.itemType === 'custom');
        const specialtyItems = orderItems.filter(item => item.itemType === 'specialty');
        const slicedCakes = orderItems.filter(item => item.itemType === 'slice');
        const coconutCandy = orderItems.filter(item => item.itemType === 'candy');
        
        let sectionsHtml = '';
        
        // Custom Cakes Section
        if (customCakes.length > 0) {
          sectionsHtml += `
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #1e40af; margin-top: 0; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">🎂 Custom Cakes</h3>
              ${customCakes.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                const sizesText = [];
                if (item.sixInchCakes > 0) sizesText.push(`${item.sixInchCakes}×6"`);
                if (item.eightInchCakes > 0) sizesText.push(`${item.eightInchCakes}×8"`);
                
                return `
                  <div style="border-left: 4px solid #1e40af; padding: 10px; margin: 10px 0; background: white; border-radius: 0 5px 5px 0;">
                    <h4 style="color: #1e40af; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="margin: 5px 0;"><strong>Price:</strong> RM ${unitPrice} each = <strong>RM ${itemTotal} total</strong></p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
                      <div><strong>Size:</strong> ${sizesText.join(', ')}</div>
                      <div><strong>Shape:</strong> ${item.shape}</div>
                      <div><strong>Layers:</strong> ${item.layers}</div>
                      <div><strong>Icing:</strong> ${item.icingType}</div>
                    </div>
                    <div style="margin: 10px 0;">
                      <div><strong>Flavors:</strong> ${item.flavors?.join(', ') || 'None specified'}</div>
                      ${item.decorations?.length > 0 ? `<div><strong>Decorations:</strong> ${item.decorations.join(', ')}</div>` : ''}
                      ${item.message ? `<div><strong>Message:</strong> "${item.message}"</div>` : ''}
                      ${item.dietaryRestrictions?.length > 0 ? `<div><strong>Dietary Restrictions:</strong> ${item.dietaryRestrictions.join(', ')}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Specialty Items Section
        if (specialtyItems.length > 0) {
          sectionsHtml += `
            <div style="background: #fef3e7; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #d97706; margin-top: 0; border-bottom: 2px solid #d97706; padding-bottom: 5px;">⭐ Specialty Items</h3>
              ${specialtyItems.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #d97706; padding: 10px; margin: 10px 0; background: white; border-radius: 0 5px 5px 0;">
                    <h4 style="color: #d97706; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="margin: 5px 0;"><strong>Price:</strong> RM ${unitPrice} each = <strong>RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin: 5px 0; color: #666;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Sliced Cakes Section
        if (slicedCakes.length > 0) {
          sectionsHtml += `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #16a34a; margin-top: 0; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">🍰 Cake Slices</h3>
              ${slicedCakes.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #16a34a; padding: 10px; margin: 10px 0; background: white; border-radius: 0 5px 5px 0;">
                    <h4 style="color: #16a34a; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="margin: 5px 0;"><strong>Price:</strong> RM ${unitPrice} each = <strong>RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin: 5px 0; color: #666;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Coconut Candy Section
        if (coconutCandy.length > 0) {
          sectionsHtml += `
            <div style="background: #fdf4ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #a855f7; margin-top: 0; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">🥥 Coconut Candy</h3>
              ${coconutCandy.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #a855f7; padding: 10px; margin: 10px 0; background: white; border-radius: 0 5px 5px 0;">
                    <h4 style="color: #a855f7; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="margin: 5px 0;"><strong>Price:</strong> RM ${unitPrice} each = <strong>RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin: 5px 0; color: #666;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        orderItemsHtml = `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Order Details</h2>
            ${sectionsHtml}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error fetching order items for email:', error);
    }
  } else {
    // Legacy single cake order
    orderItemsHtml = `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Cake Specifications</h2>
        <p><strong>Size:</strong> ${order.sixInchCakes}x6" + ${order.eightInchCakes}x8" cake${(order.sixInchCakes + order.eightInchCakes) > 1 ? 's' : ''}</p>
        <p><strong>Layers:</strong> ${order.layers}</p>
        <p><strong>Shape:</strong> ${order.shape}</p>
        <p><strong>Flavors:</strong> ${order.flavors.join(', ')}</p>
        <p><strong>Icing:</strong> ${order.icingType}</p>
        ${order.decorations.length > 0 ? `<p><strong>Decorations:</strong> ${order.decorations.join(', ')}</p>` : ''}
        ${order.message ? `<p><strong>Message:</strong> "${order.message}"</p>` : ''}
        ${order.dietaryRestrictions.length > 0 ? `<p><strong>Dietary Restrictions:</strong> ${order.dietaryRestrictions.join(', ')}</p>` : ''}
      </div>
    `;
  }
  
  return {
    subject: `🎂 New ${order.hasLineItems ? 'Multi-Item' : 'Cake'} Order #${order.id} from ${order.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #ff69b4; text-align: center;">New Order Received!</h1>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order #:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Order Type:</strong> ${order.hasLineItems ? 'Multi-Item Order' : 'Single Custom Cake'}</p>
          <p><strong>Total Amount:</strong> RM ${totalPrice}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Customer Information</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || 'Not provided'}</p>
          <p><strong>Delivery Method:</strong> ${order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
        </div>

        ${orderItemsHtml}
        
        ${order.specialInstructions ? `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Special Instructions</h2>
            <p>${order.specialInstructions}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>Please process this order as soon as possible.</p>
          <p>You can view the full order details in the admin panel.</p>
        </div>
      </div>
    `
  };
};

// Customer email template
const createCustomerEmailTemplate = async (order: CakeOrder) => {
  const totalPrice = (order.totalPrice / 100).toFixed(2);
  const orderDate = new Date(order.orderDate).toLocaleDateString();
  const estimatedDays = order.deliveryMethod === 'pickup' ? '2-3' : '3-4';
  
  // Check if this is a multi-item order
  let orderItemsHtml = '';
  if (order.hasLineItems) {
    try {
      const orderItems = await storage.getOrderItemsByOrderId(order.id);
      if (orderItems && orderItems.length > 0) {
        // Organize items by type for better presentation (customer email)
        const customCakes = orderItems.filter(item => item.itemType === 'custom');
        const specialtyItems = orderItems.filter(item => item.itemType === 'specialty');
        const slicedCakes = orderItems.filter(item => item.itemType === 'slice');
        const coconutCandy = orderItems.filter(item => item.itemType === 'candy');
        
        let customerSectionsHtml = '';
        
        // Custom Cakes Section (Customer Version)
        if (customCakes.length > 0) {
          customerSectionsHtml += `
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #1e40af; margin-top: 0; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">🎂 Your Custom Cakes</h3>
              ${customCakes.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                const sizesText = [];
                if (item.sixInchCakes > 0) sizesText.push(`${item.sixInchCakes}×6"`);
                if (item.eightInchCakes > 0) sizesText.push(`${item.eightInchCakes}×8"`);
                
                return `
                  <div style="border-left: 4px solid #1e40af; padding: 15px; margin: 10px 0; background: white; border-radius: 0 8px 8px 0;">
                    <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="color: #666; margin-bottom: 15px;">RM ${unitPrice} each = <strong style="color: #1e40af;">RM ${itemTotal} total</strong></p>
                    <div style="margin-left: 15px; color: #555;">
                      <p style="margin: 5px 0;"><strong>Size:</strong> ${sizesText.join(', ')}</p>
                      <p style="margin: 5px 0;"><strong>Shape:</strong> ${item.shape}</p>
                      <p style="margin: 5px 0;"><strong>Layers:</strong> ${item.layers}</p>
                      <p style="margin: 5px 0;"><strong>Flavors:</strong> ${item.flavors?.join(', ') || 'None specified'}</p>
                      <p style="margin: 5px 0;"><strong>Icing:</strong> ${item.icingType}</p>
                      ${item.decorations?.length > 0 ? `<p style="margin: 5px 0;"><strong>Decorations:</strong> ${item.decorations.join(', ')}</p>` : ''}
                      ${item.message ? `<p style="margin: 5px 0;"><strong>Message:</strong> "${item.message}"</p>` : ''}
                      ${item.dietaryRestrictions?.length > 0 ? `<p style="margin: 5px 0;"><strong>Dietary Restrictions:</strong> ${item.dietaryRestrictions.join(', ')}</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Specialty Items Section (Customer Version)
        if (specialtyItems.length > 0) {
          customerSectionsHtml += `
            <div style="background: #fef3e7; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #d97706; margin-top: 0; border-bottom: 2px solid #d97706; padding-bottom: 5px;">⭐ Specialty Items</h3>
              ${specialtyItems.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #d97706; padding: 15px; margin: 10px 0; background: white; border-radius: 0 8px 8px 0;">
                    <h4 style="color: #d97706; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="color: #666;">RM ${unitPrice} each = <strong style="color: #d97706;">RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin-left: 15px; color: #555;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Sliced Cakes Section (Customer Version)
        if (slicedCakes.length > 0) {
          customerSectionsHtml += `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #16a34a; margin-top: 0; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">🍰 Cake Slices</h3>
              ${slicedCakes.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #16a34a; padding: 15px; margin: 10px 0; background: white; border-radius: 0 8px 8px 0;">
                    <h4 style="color: #16a34a; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="color: #666;">RM ${unitPrice} each = <strong style="color: #16a34a;">RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin-left: 15px; color: #555;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        // Coconut Candy Section (Customer Version)
        if (coconutCandy.length > 0) {
          customerSectionsHtml += `
            <div style="background: #fdf4ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #a855f7; margin-top: 0; border-bottom: 2px solid #a855f7; padding-bottom: 5px;">🥥 Coconut Candy</h3>
              ${coconutCandy.map(item => {
                const itemTotal = (item.totalPrice / 100).toFixed(2);
                const unitPrice = (item.unitPrice / 100).toFixed(2);
                
                return `
                  <div style="border-left: 4px solid #a855f7; padding: 15px; margin: 10px 0; background: white; border-radius: 0 8px 8px 0;">
                    <h4 style="color: #a855f7; margin-top: 0;">${item.itemName} (Qty: ${item.quantity})</h4>
                    <p style="color: #666;">RM ${unitPrice} each = <strong style="color: #a855f7;">RM ${itemTotal} total</strong></p>
                    ${item.specialtyDescription ? `<p style="margin-left: 15px; color: #555;">${item.specialtyDescription}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }
        
        orderItemsHtml = `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Your Order Details</h2>
            ${customerSectionsHtml}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error fetching order items for customer email:', error);
    }
  } else {
    // Legacy single cake order
    orderItemsHtml = `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Your Cake Details</h2>
        <p><strong>Size:</strong> ${order.sixInchCakes}x6" + ${order.eightInchCakes}x8" cake${(order.sixInchCakes + order.eightInchCakes) > 1 ? 's' : ''}</p>
        <p><strong>Layers:</strong> ${order.layers}</p>
        <p><strong>Shape:</strong> ${order.shape}</p>
        <p><strong>Flavors:</strong> ${order.flavors.join(', ')}</p>
        <p><strong>Icing:</strong> ${order.icingType}</p>
        ${order.decorations.length > 0 ? `<p><strong>Decorations:</strong> ${order.decorations.join(', ')}</p>` : ''}
        ${order.message ? `<p><strong>Message:</strong> "${order.message}"</p>` : ''}
        ${order.dietaryRestrictions.length > 0 ? `<p><strong>Dietary Restrictions:</strong> ${order.dietaryRestrictions.join(', ')}</p>` : ''}
      </div>
    `;
  }
  
  return {
    subject: `🎂 Thank You for Your ${order.hasLineItems ? 'Order' : 'Cake Order'} #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #ff69b4; text-align: center;">Thank You for Your Order!</h1>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
          <p><strong>Order #:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Order Type:</strong> ${order.hasLineItems ? 'Multi-Item Order' : 'Custom Cake'}</p>
          <p><strong>Total Amount:</strong> RM ${totalPrice}</p>
          <p><strong>Estimated Ready Date:</strong> ${estimatedDays} business days</p>
        </div>

        ${orderItemsHtml}
        
        ${order.specialInstructions ? `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Special Instructions</h2>
            <p>${order.specialInstructions}</p>
          </div>
        ` : ''}

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Next Steps</h2>
          <p>Our team will contact you within 24 hours to confirm your order details and arrange ${order.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>Thank you for choosing our cake service!</p>
        </div>
      </div>
    `
  };
};

// Send email function
export async function sendOrderEmails(order: CakeOrder) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  // Check environment variables
  if (!adminEmail) {
    console.warn('⚠️ Admin email notifications disabled - ADMIN_EMAIL not set');
    console.warn('Current environment variables:');
    console.warn('- ADMIN_EMAIL:', adminEmail ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '[SET]' : '[NOT SET]');
    console.warn('- FROM_EMAIL:', process.env.FROM_EMAIL ? '[SET]' : '[NOT SET]');
    return;
  }
  
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    console.warn('⚠️ Brevo SMTP credentials not set - email notifications will be disabled');
    console.warn('Current environment variables:');
    console.warn('- ADMIN_EMAIL:', adminEmail ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '[SET]' : '[NOT SET]');
    console.warn('- FROM_EMAIL:', process.env.FROM_EMAIL ? '[SET]' : '[NOT SET]');
    return;
  }
  
  try {
    console.log(`📧 Starting email sending process for order #${order.id}`);
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`📧 Customer email: ${order.customerEmail}`);
    console.log(`📧 From email: ${process.env.FROM_EMAIL || 'orders@cakecraftpro.com'}`);
    
    // Verify transporter configuration
    console.log('🔧 Verifying SMTP transporter...');
    await transporter.verify();
    console.log('✅ SMTP transporter verified successfully');
    
    // Send admin notification
    console.log('📤 Sending admin notification email...');
    const adminTemplate = await createAdminEmailTemplate(order);
    const adminResult = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'orders@cakecraftpro.com',
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });
    console.log('✅ Admin notification email sent successfully');
    console.log('📧 Admin email result:', adminResult.messageId);

    // Send customer confirmation
    console.log('📤 Sending customer confirmation email...');
    const customerTemplate = await createCustomerEmailTemplate(order);
    const customerResult = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'orders@cakecraftpro.com',
      to: order.customerEmail,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
    });
    console.log('✅ Customer confirmation email sent successfully');
    console.log('📧 Customer email result:', customerResult.messageId);
    
    console.log('🎉 All emails sent successfully for order #' + order.id);
    
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    console.error('❌ Email error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    // Don't throw the error - we don't want email failures to break order creation
    console.error('❌ Email sending failed, but order was still created successfully');
  }
}

// Contact form email interface
interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: string;
}

// Send contact form email to admin
export async function sendContactEmail(contactData: ContactMessage) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  // Check environment variables
  if (!adminEmail) {
    console.warn('⚠️ Contact form email notifications disabled - ADMIN_EMAIL not set');
    console.warn('Current environment variables:');
    console.warn('- ADMIN_EMAIL:', adminEmail ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '[SET]' : '[NOT SET]');
    console.warn('- FROM_EMAIL:', process.env.FROM_EMAIL ? '[SET]' : '[NOT SET]');
    throw new Error('ADMIN_EMAIL not configured - contact form emails cannot be sent');
  }
  
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    console.warn('⚠️ Brevo SMTP credentials not set - contact form emails will fail');
    console.warn('Current environment variables:');
    console.warn('- ADMIN_EMAIL:', adminEmail ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER ? '[SET]' : '[NOT SET]');
    console.warn('- BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '[SET]' : '[NOT SET]');
    console.warn('- FROM_EMAIL:', process.env.FROM_EMAIL ? '[SET]' : '[NOT SET]');
    throw new Error('SMTP credentials not configured - contact form emails cannot be sent');
  }
  
  try {
    console.log(`📧 Starting contact form email sending process`);
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`📧 Contact from: ${contactData.name} <${contactData.email}>`);
    console.log(`📧 Subject: ${contactData.subject}`);
    console.log(`📧 From email: ${process.env.FROM_EMAIL || 'contact@cakecraftpro.com'}`);
    
    // Verify transporter configuration
    console.log('🔧 Verifying SMTP transporter for contact form...');
    await transporter.verify();
    console.log('✅ SMTP transporter verified successfully for contact form');
    
    const subject = `Contact Form: ${contactData.subject}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ec4899; }
          .timestamp { color: #666; font-size: 12px; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍰 New Contact Message</h1>
            <p>Someone has sent a message through your website</p>
          </div>
          
          <div class="content">
            <div class="info-box">
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
              <p><strong>Subject:</strong> ${contactData.subject}</p>
            </div>
            
            <div class="info-box">
              <h3>Message</h3>
              <p style="white-space: pre-wrap;">${contactData.message}</p>
            </div>
            
            <div class="timestamp">
              Received: ${new Date(contactData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📤 Sending contact form email...');
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'contact@cakecraftpro.com',
      to: adminEmail,
      subject: subject,
      html: html,
    });
    
    console.log('✅ Contact form email sent successfully to admin');
    console.log('📧 Contact email result:', result.messageId);
    console.log('🎉 Contact form email process completed successfully');
    
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    console.error('❌ Contact email error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw error;
  }
}