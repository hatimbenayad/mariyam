import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TypewriterText from './TypewriterText';
import LiquidBackground from './LiquidBackground';
import './ProductsShowcase.css';

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Classic Caramel",
    price: "$6.00",
    color: "#D9A566", // Caramel
    image: "/Products Showcase 1.png",
  },
  {
    id: 2,
    name: "Classic Vanilla Bean",
    price: "$5.50",
    color: "#B5854C", // Deeper brown
    image: "/Products Showcase 2.png",
  },
  {
    id: 3,
    name: "Double Chocolate",
    price: "$6.50",
    color: "#E5C158", // Golden yellow
    image: "/Products Showcase 3.png",
  },
  {
    id: 4,
    name: "Spiced Chai",
    price: "$6.00",
    color: "#C27E67", // Muted terracotta
    image: "/Products Showcase 4.png",
  }
];

export default function ProductsShowcase({
  headingLine1 = "CHOOSE YOUR",
  headingLine2 = "FLAVOR",
  products = DEFAULT_PRODUCTS
}) {
  const sectionRef = useRef(null);

  // Trigger animation once when the section is 40% into the viewport
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-40% 0px",
  });

  const [line1Done, setLine1Done] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  // Card stagger animation
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Stagger left to right
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="products-showcase" ref={sectionRef} aria-label="Products Showcase">
      <LiquidBackground imageUrl="/pumera.png" />
      <div className="ps__container">

        {/* ── Headings ── */}
        <div className="ps__header">
          {isInView && (
            <TypewriterText
              as="h2"
              className="ps__heading-solid"
              text={headingLine1}
              speed={0.03}
              onComplete={() => setLine1Done(true)}
            />
          )}

          {/* We only render Line 2 after Line 1 is done, or simultaneously. 
              The prompt suggests a fast type, maybe we can type them both with a delay,
              or sequentially. Sequentially is safer to read. */}
          {line1Done && (
            <TypewriterText
              as="h1"
              className="ps__heading-hollow"
              text={headingLine2}
              speed={0.04}
              onComplete={() => setLine2Done(true)}
            />
          )}
          {/* Placeholder to keep layout height stable while typing */}
          {!line1Done && <h1 className="ps__heading-hollow" style={{ opacity: 0, userSelect: 'none' }}>{headingLine2}</h1>}
        </div>

        {/* ── Products Strip ── */}
        <motion.div
          className="ps__grid"
          variants={cardContainerVariants}
          initial="hidden"
          // We trigger the cards once line 2 finishes typing
          animate={line2Done ? "visible" : "hidden"}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="ps__card"
              variants={cardVariants}
              style={{ backgroundColor: product.color }}
            >
              <div className="ps__card-content">
                <h3 className="ps__card-title">{product.name}</h3>

                <div className="ps__card-image-wrapper">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="ps__card-image" draggable={false} />
                  ) : (
                    <div className="ps__photo-placeholder">🍮</div>
                  )}
                </div>

                <div className="ps__card-hover-ui">
                  <button className="ps__btn-add">
                    <span>ADD TO CART</span>
                    <span>{product.price}</span>
                  </button>
                  <button className="ps__btn-view">
                    <span>VIEW PRODUCT</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
