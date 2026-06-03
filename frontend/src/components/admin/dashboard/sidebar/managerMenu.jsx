import {
  BarChartFill,
  PeopleFill,
  ReceiptCutoff,
  ClipboardCheck,
  List,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  CheckCircleFill,
  Building,
  GridFill,
  BoundingBox,
  Table,

  // ==========================================
  // MENU ICONS
  // ==========================================
  MenuButtonWideFill,
  TagsFill,
  CupHotFill,
  LayersFill,
  PlusSquareFill,
  Link45deg,
  CollectionFill,
  Diagram3Fill,
  Percent,
  GraphUpArrow,
  ClockFill,

  // ==========================================
  // INVENTORY ICONS
  // ==========================================
  BoxSeamFill,
  ArchiveFill,
  Truck,
  CartCheckFill,
  ArrowLeftRight,

  Clipboard2DataFill,

  // ==========================================
  // POSH DASHBOARD
  // ==========================================
  Shop
  
} from "react-bootstrap-icons";



const managerMenu = [
  // ==========================================
  // REPORTS
  // ==========================================
  {
    key: "reports",
    label: "Reports",
    icon: <BarChartFill />,
    children: [
      {
        key: "sales-report",
        label: "Sales Reports",
      },
      {
        key: "product-report",
        label: "Product Reports",
      },
      {
        key: "time-analysis",
        label: "Time Analysis",
      },
      {
        key: "kitchen-report",
        label: "Kitchen Report",
      },
    ],
  },


  // ==========================================
  // POS DASHBOARD 
  // ==========================================
  {
    key: "pos-dashboard",
    label: "POS Dashboard",
    icon: <Shop />,
  },

  // ==========================================
  // ORDERS
  // ==========================================
  {
    key: "orders",
    label: "Orders",
    icon: <ClipboardCheck />,
  },
  
  // ==========================================
  // STAFF
  // ==========================================
  {
    key: "staff",
    label: "Staff",
    icon: <PeopleFill />,
  },

  // ==========================================
  // FLOOR MANAGEMENT
  // ==========================================
  {
    key: "floors",
    label: "Floors",
    icon: <GridFill />,
  },

  // ==========================================
  // AREA MANAGEMENT
  // ==========================================
  {
    key: "areas",
    label: "Areas",
    icon: <BoundingBox />,
  },

  // ==========================================
  // TABLE MANAGEMENT
  // ==========================================
  {
    key: "tables",
    label: "Tables",
    icon: <Table />,
  },

  // ==========================================
  // MENU MANAGEMENT DROPDOWN
  // ==========================================
  {
    key: "menu-management",
    label: "Menu Management",
    icon: <MenuButtonWideFill />,

    children: [
      // ======================================
      // CATEGORIES
      // ======================================
      {
        key: "categories",
        label: "Categories",
        icon: <TagsFill />,
      },

      // ======================================
      // PRODUCTS
      // ======================================
      {
        key: "products",
        label: "Products",
        icon: <CupHotFill />,
      },

      // ======================================
      // PRODUCT VARIANTS
      // ======================================
      {
        key: "product-variants",
        label: "Variants",
        icon: <LayersFill />,
      },

      // ======================================
      // ADDONS
      // ======================================
      {
        key: "addons",
        label: "Addons",
        icon: <PlusSquareFill />,
      },

      // ======================================
      {
        key: "product-addons",
        label: "Product Addons",
        icon: <Link45deg />,
      },

      // ======================================
      // COMBOS
      // ======================================
      {
        key: "combos",
        label: "Combos",
        icon: <CollectionFill />,
      },

      {
        key: "combo-products",
        label: "Combo Products",
        icon: <Diagram3Fill />,
      },

      // ======================================
      // TAXES
      // ======================================
      {
        key: "tax-pricing",
        label: "Tax & Pricing",
        icon: <Percent />,

        children: [
          // ==================================
          // TAX MANAGEMENT
          // ==================================
          {
            key: "taxes",
            label: "Taxes",
            icon: <Percent />,
          },

          // ==================================
          // PRODUCT TAX MAPPING
          // ==================================
          {
            key: "product-taxes",
            label: "Product Taxes",
            icon: <Link45deg />,
          },

          // ==================================
          // SERVICE CHARGES
          // ==================================
          {
            key: "service-charges",
            label: "Service Charges",
            icon: <ReceiptCutoff />,
          },

          // ==================================
          // DYNAMIC PRICING
          // ==================================
          {
            key: "dynamic-pricing",
            label: "Dynamic Pricing",
            icon: <GraphUpArrow />,
          },
          // ==================================
          // PRODUCT DYNAMIC PRICING
          // ==================================
          {
            key: "product-dynamic-pricing",
            label: "Product Dynamic Pricing",
            icon: <Link45deg />,
          },

          // ==================================
          // CMOBO DYNAMIC PRICING
          // ==================================
          {
            key: "combo-dynamic-pricing",
            label: "Combo Dynamic Pricing",
            icon: <Link45deg />,
          },
        ],
      },

      // ======================================
      // OFFERS / HAPPY HOURS
      // ======================================
      {
        key: "offers",
        label: "Offers",
        icon: <ClockFill />,
      },
    ],
  },

  // ==========================================
  // INVENTORY MANAGEMENT DROPDOWN
  // ==========================================
  {
    key: "inventory-management",
    label: "Inventory",
    icon: <BoxSeamFill />,

    children: [
      // ======================================
      // UNITS
      // ======================================
      {
        key: "units",
        label: "Units",
        icon: <ArchiveFill />,
      },

      // ======================================
      // INGREDIENTS
      // ======================================
      {
        key: "ingredients",
        label: "Ingredients",
        icon: <BoxSeamFill />,
      },

      // ======================================
      // SUPPLIERS
      // ======================================
      {
        key: "suppliers",
        label: "Suppliers",
        icon: <Truck />,
      },

      // ======================================
      // PURCHASES
      // ======================================
      {
        key: "purchases",
        label: "Purchases",
        icon: <CartCheckFill />,
      },

      {
        key: "inventory-transaction",
        label: "Inventory Transaction",
        icon: <ArrowLeftRight />,
      },

      {
        key: "product-recipes",
        label: "Product Recipes",
        icon: <Clipboard2DataFill />,
      },

      {
        key: "combo-recipes",
        label: "Combo Recipes",
        icon: <Diagram3Fill />,
      },
    ],
  },

  // ==========================================
  // BILLING
  // ==========================================
  {
    key: "billing",
    label: "Billing",
    icon: <ReceiptCutoff />,
  },
  {
    key: "kitchen",
    label: "Kitchen",
    icon: <ReceiptCutoff />,
  },
]

export default managerMenu;
