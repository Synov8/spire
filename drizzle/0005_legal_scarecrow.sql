ALTER TABLE "access_relationship" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "asset" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "data_flow" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "evidence" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "policy_rule" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "access_relationship" CASCADE;--> statement-breakpoint
DROP TABLE "asset" CASCADE;--> statement-breakpoint
DROP TABLE "data_flow" CASCADE;--> statement-breakpoint
DROP TABLE "evidence" CASCADE;--> statement-breakpoint
DROP TABLE "policy" CASCADE;--> statement-breakpoint
DROP TABLE "policy_rule" CASCADE;--> statement-breakpoint
ALTER TABLE "policy_check" DROP CONSTRAINT "policy_check_rule_id_policy_rule_id_fk";
--> statement-breakpoint
ALTER TABLE "policy_check" DROP CONSTRAINT "policy_check_asset_id_asset_id_fk";
--> statement-breakpoint
ALTER TABLE "policy_check" DROP COLUMN "asset_id";