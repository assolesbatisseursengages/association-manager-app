-- Fix global_settings table to match Drizzle schema
ALTER TABLE `global_settings` 
  CHANGE COLUMN `city` `seatCity` varchar(255) DEFAULT "N'djaména-tchad" NOT NULL,
  ADD COLUMN `email` varchar(320) DEFAULT "contact.lesbatisseursengages@gmail.com" NOT NULL AFTER `folio`,
  MODIFY COLUMN `associationName` varchar(255) DEFAULT "Les Bâtisseurs Engagés" NOT NULL,
  MODIFY COLUMN `folio` varchar(100) DEFAULT "10512" NOT NULL,
  MODIFY COLUMN `website` varchar(500) DEFAULT "www.lesbatisseursengage.com" NOT NULL,
  ADD COLUMN `updatedBy` int AFTER `description`;
