import nodemailer from 'nodemailer';
import { CakeOrder } from '@shared/schema';

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
const createAdminEmailTemplate = (order: CakeOrder) => {
  const totalPrice = (order.totalPrice / 100).toFixed(2);
  const orderDate = new Date(order.orderDate).toLocaleDateString();
  
  return {
    subject: `🎂 New Cake Order #${order.id} from ${order.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #ff69b4; text-align: center;">New Cake Order Received!</h1>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order #:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Total Amount:</strong> RM ${totalPrice}</p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Customer Information</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || 'Not provided'}</p>
          <p><strong>Delivery Method:</strong> ${order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
        </div>

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
          ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>Please process this order as soon as possible.</p>
          <p>You can view the full order details in the admin panel.</p>
        </div>
      </div>
    `
  };
};

// Customer email template
const createCustomerEmailTemplate = (order: CakeOrder) => {
  const totalPrice = (order.totalPrice / 100).toFixed(2);
  const orderDate = new Date(order.orderDate).toLocaleDateString();
  const estimatedDays = order.deliveryMethod === 'pickup' ? '2-3' : '3-4';
  
  return {
    subject: `🎂 Thank You for Your Cake Order #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #ff69b4; text-align: center;">Thank You for Your Order!</h1>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
          <p><strong>Order #:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Total Amount:</strong> RM ${totalPrice}</p>
          <p><strong>Estimated Ready Date:</strong> ${estimatedDays} business days</p>
        </div>

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
          ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
        </div>

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
  if (!adminEmail) {
    console.warn('⚠️ Admin email notifications disabled - ADMIN_EMAIL not set');
    return;
  }
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    console.warn('⚠️ Brevo SMTP credentials not set - email notifications will be disabled');
    return;
  }
  try {
    // Send admin notification
    const adminTemplate = createAdminEmailTemplate(order);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'orders@cakecraftpro.com',
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });
    console.log('✅ Admin notification email sent successfully');

    // Send customer confirmation
    const customerTemplate = createCustomerEmailTemplate(order);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'orders@cakecraftpro.com',
      to: order.customerEmail,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
    });
    console.log('✅ Customer confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  }
}