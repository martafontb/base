# Risograph Printing Theme - Shopify

A custom Shopify theme built for risograph printing services and products, featuring vibrant colors and a modern, responsive design.

## Theme Structure

```
├── assets/            # CSS, JS, and other static files
├── blocks/            # Block components used within sections
├── config/            # Theme settings and configuration
├── layout/            # Theme layout templates
├── locales/           # Translation files
├── sections/          # Theme sections
├── snippets/          # Reusable code snippets
└── templates/         # Page templates
```

## Core Components

### JavaScript Components

- **cart.js**: Handles cart functionality with fetch endpoints
- **lazyload.js**: Manages intersection observers for lazy loading images and animations
- **accordion-content.js**: Custom web component for accordion functionality
- **custom-select.js**: Custom web component for select dropdowns
- **popup-modal.js**: Modal functionality for various UI elements

### CSS Files

- **global.css**: Base global styles
- **typography.css**: Typography system
- **buttons.css**: Button styles
- **theme.css**: Theme variables and settings
- **animate.css**: Animation utilities
- **preflight.css**: CSS reset and normalization

### Custom Web Components

- `<accordion-content>`: Toggleable content sections
- `<custom-select>`: Enhanced select dropdown
- `<popup-modal>`: Modal dialog
- `<cart-drawer>`: Off-canvas cart

## Setup and Installation

### Prerequisites

- Shopify CLI
- Node.js 14+
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone [repository-url]
cd base
```

2. Log in to Shopify with the CLI:
```bash
shopify login
```

3. Connect to your development store:
```bash
shopify theme dev --store jakelucas.myshopify.com
```

4. The theme will be served locally and changes will automatically sync to your development store.

### Shopify CLI Commands

- **Start development server**:
  ```bash
  shopify theme dev
  ```

- **Push theme changes**:
  ```bash
  shopify theme push
  ```

- **Pull theme changes**:
  ```bash
  shopify theme pull
  ```

- **Create a theme package**:
  ```bash
  shopify theme package
  ```

## Theme Customization

### Theme Editor

The theme is fully customizable through the Shopify Theme Editor, with settings for:

- Color schemes
- Typography (font families, sizes, and weights)
- Button styles and borders
- Section layouts and spacing
- Header and footer configurations

### Adding Custom Colors

1. Navigate to **Online Store > Themes > Customize**
2. Select **Theme Settings > Colors**
3. Add new color schemes for different sections

## Working with Risograph Features

### Managing Ink Colors

Risograph ink colors are managed through metafields on products. Each ink color has:
- Color code
- Pantone reference
- Opacity level
- Availability status

### Service Inquiry Forms

Service inquiry forms use the custom form handling in the services page section. Form submissions can be:
- Sent to a specified email
- Saved to a customer metafield
- Pushed to a third-party CRM

## Performance Optimization

- Images use lazy loading via the LazyLoad module
- Critical CSS is inlined in the `<head>`
- JavaScript is deferred where possible
- Custom elements use Intersection Observer for efficient rendering

## Troubleshooting

### Common Issues

**Cart not updating:**
- Check for JavaScript console errors
- Verify that the cart endpoints are accessible
- Clear browser cache and cookies

**Custom select not working:**
- Ensure the popup-modal.js is loaded
- Check for duplicate IDs in the select elements

**Images not lazy loading:**
- Verify the loading="lazy" attribute is present
- Check that the IntersectionObserver is supported in the browser
- Ensure images have width and height attributes

## Deployment

1. Test your theme thoroughly on a development store
2. Use theme package command to create a .zip file:
   ```bash
   shopify theme package
   ```
3. Upload the .zip file to your production store or publish from development

## Credits

Theme developed by Marta Font for Jumbo Press.

