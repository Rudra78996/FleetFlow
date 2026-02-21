// @ts-nocheck
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await prisma.expense.deleteMany();
    await prisma.fuelLog.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 12);
    const users = await Promise.all([
        prisma.user.create({
            data: { name: "Admin Manager", email: "admin@fleetflow.com", password: hashedPassword, role: "FLEET_MANAGER" },
        }),
        prisma.user.create({
            data: { name: "John Dispatcher", email: "dispatcher@fleetflow.com", password: hashedPassword, role: "DISPATCHER" },
        }),
        prisma.user.create({
            data: { name: "Sarah Safety", email: "safety@fleetflow.com", password: hashedPassword, role: "SAFETY_OFFICER" },
        }),
        prisma.user.create({
            data: { name: "Mike Finance", email: "finance@fleetflow.com", password: hashedPassword, role: "FINANCIAL_ANALYST" },
        }),
    ]);

    // Create vehicles
    const vehicles = await Promise.all([
        prisma.vehicle.create({
            data: { name: "Volvo FH16", model: "FH16 2024", licensePlate: "FL-1001", type: "TRUCK", maxCapacity: 25000, odometer: 45200, initialOdometer: 0, acquisitionCost: 85000, status: "AVAILABLE", region: "North" },
        }),
        prisma.vehicle.create({
            data: { name: "Scania R500", model: "R500 2023", licensePlate: "FL-1002", type: "TRUCK", maxCapacity: 20000, odometer: 67800, initialOdometer: 0, acquisitionCost: 78000, status: "ON_TRIP", region: "South" },
        }),
        prisma.vehicle.create({
            data: { name: "Mercedes Sprinter", model: "Sprinter 2024", licensePlate: "FL-2001", type: "VAN", maxCapacity: 3500, odometer: 23100, initialOdometer: 0, acquisitionCost: 42000, status: "AVAILABLE", region: "East" },
        }),
        prisma.vehicle.create({
            data: { name: "Ford Transit", model: "Transit 2023", licensePlate: "FL-2002", type: "VAN", maxCapacity: 4000, odometer: 31500, initialOdometer: 0, acquisitionCost: 38000, status: "IN_SHOP", region: "West" },
        }),
        prisma.vehicle.create({
            data: { name: "Iveco Daily", model: "Daily 2024", licensePlate: "FL-2003", type: "VAN", maxCapacity: 3200, odometer: 12400, initialOdometer: 0, acquisitionCost: 35000, status: "AVAILABLE", region: "North" },
        }),
        prisma.vehicle.create({
            data: { name: "MAN TGX", model: "TGX 2023", licensePlate: "FL-1003", type: "TRUCK", maxCapacity: 22000, odometer: 89100, initialOdometer: 0, acquisitionCost: 92000, status: "ON_TRIP", region: "South" },
        }),
        prisma.vehicle.create({
            data: { name: "DAF XF", model: "XF 2024", licensePlate: "FL-1004", type: "TRUCK", maxCapacity: 24000, odometer: 15600, initialOdometer: 0, acquisitionCost: 88000, status: "AVAILABLE", region: "East" },
        }),
        prisma.vehicle.create({
            data: { name: "Honda CB500X", model: "CB500X 2024", licensePlate: "FL-3001", type: "BIKE", maxCapacity: 50, odometer: 8700, initialOdometer: 0, acquisitionCost: 7500, status: "AVAILABLE", region: "North" },
        }),
        prisma.vehicle.create({
            data: { name: "Yamaha XMAX", model: "XMAX 2024", licensePlate: "FL-3002", type: "BIKE", maxCapacity: 30, odometer: 5200, initialOdometer: 0, acquisitionCost: 6000, status: "AVAILABLE", region: "West" },
        }),
        prisma.vehicle.create({
            data: { name: "Renault Master", model: "Master 2023", licensePlate: "FL-2004", type: "VAN", maxCapacity: 4500, odometer: 42300, initialOdometer: 0, acquisitionCost: 40000, status: "RETIRED", region: "South" },
        }),
    ]);

    // Create drivers
    const drivers = await Promise.all([
        prisma.driver.create({
            data: { name: "James Wilson", licenseNumber: "DL-25001", licenseExpiry: new Date("2027-06-15"), licenseCategory: "C", status: "AVAILABLE", safetyScore: 95, completionRate: 98, complaints: 0 },
        }),
        prisma.driver.create({
            data: { name: "Emily Carter", licenseNumber: "DL-25002", licenseExpiry: new Date("2027-03-20"), licenseCategory: "C", status: "ON_DUTY", safetyScore: 92, completionRate: 96, complaints: 1 },
        }),
        prisma.driver.create({
            data: { name: "Robert Chen", licenseNumber: "DL-25003", licenseExpiry: new Date("2026-12-01"), licenseCategory: "D", status: "AVAILABLE", safetyScore: 88, completionRate: 94, complaints: 2 },
        }),
        prisma.driver.create({
            data: { name: "Maria Garcia", licenseNumber: "DL-25004", licenseExpiry: new Date("2028-01-10"), licenseCategory: "C", status: "AVAILABLE", safetyScore: 97, completionRate: 99, complaints: 0 },
        }),
        prisma.driver.create({
            data: { name: "David Kim", licenseNumber: "DL-25005", licenseExpiry: new Date("2025-08-30"), licenseCategory: "B", status: "OFF_DUTY", safetyScore: 78, completionRate: 85, complaints: 3 },
        }),
        prisma.driver.create({
            data: { name: "Lisa Johnson", licenseNumber: "DL-25006", licenseExpiry: new Date("2027-09-15"), licenseCategory: "C", status: "AVAILABLE", safetyScore: 91, completionRate: 97, complaints: 0 },
        }),
        prisma.driver.create({
            data: { name: "Tom Anderson", licenseNumber: "DL-25007", licenseExpiry: new Date("2026-04-22"), licenseCategory: "D", status: "SUSPENDED", safetyScore: 62, completionRate: 70, complaints: 8 },
        }),
        prisma.driver.create({
            data: { name: "Sarah Lee", licenseNumber: "DL-25008", licenseExpiry: new Date("2027-11-30"), licenseCategory: "B", status: "ON_DUTY", safetyScore: 89, completionRate: 93, complaints: 1 },
        }),
    ]);

    // Create trips
    const trips = await Promise.all([
        prisma.trip.create({
            data: { vehicleId: vehicles[1].id, driverId: drivers[1].id, origin: "Mumbai", destination: "Pune", cargoWeight: 15000, estimatedFuelCost: 4500, actualFuelCost: 4200, distance: 150, revenue: 25000, status: "DISPATCHED", createdAt: new Date("2026-02-15") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[5].id, driverId: drivers[7].id, origin: "Delhi", destination: "Jaipur", cargoWeight: 18000, estimatedFuelCost: 8200, actualFuelCost: 7800, distance: 280, revenue: 35000, status: "DISPATCHED", createdAt: new Date("2026-02-16") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[0].id, driverId: drivers[0].id, origin: "Bangalore", destination: "Chennai", cargoWeight: 20000, estimatedFuelCost: 9500, actualFuelCost: 9200, distance: 350, revenue: 42000, status: "COMPLETED", completedAt: new Date("2026-02-10"), createdAt: new Date("2026-02-08") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[2].id, driverId: drivers[2].id, origin: "Kolkata", destination: "Patna", cargoWeight: 2800, estimatedFuelCost: 5600, actualFuelCost: 5200, distance: 600, revenue: 18000, status: "COMPLETED", completedAt: new Date("2026-02-12"), createdAt: new Date("2026-02-10") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[6].id, driverId: drivers[3].id, origin: "Hyderabad", destination: "Vizag", cargoWeight: 22000, estimatedFuelCost: 7800, actualFuelCost: 7500, distance: 620, revenue: 38000, status: "COMPLETED", completedAt: new Date("2026-02-14"), createdAt: new Date("2026-02-12") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[4].id, driverId: drivers[5].id, origin: "Ahmedabad", destination: "Surat", cargoWeight: 2500, estimatedFuelCost: 2800, actualFuelCost: 2600, distance: 265, revenue: 12000, status: "COMPLETED", completedAt: new Date("2026-02-09"), createdAt: new Date("2026-02-08") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[0].id, driverId: drivers[0].id, origin: "Chennai", destination: "Coimbatore", cargoWeight: 18000, estimatedFuelCost: 6200, actualFuelCost: 0, distance: 500, revenue: 28000, status: "DRAFT", createdAt: new Date("2026-02-19") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[7].id, driverId: drivers[4].id, origin: "Bangalore", destination: "Mysore", cargoWeight: 40, estimatedFuelCost: 500, actualFuelCost: 450, distance: 150, revenue: 2000, status: "COMPLETED", completedAt: new Date("2026-02-07"), createdAt: new Date("2026-02-07") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[2].id, driverId: drivers[2].id, origin: "Mumbai", destination: "Nashik", cargoWeight: 3000, estimatedFuelCost: 3200, actualFuelCost: 3000, distance: 166, revenue: 15000, status: "COMPLETED", completedAt: new Date("2026-02-05"), createdAt: new Date("2026-02-04") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[6].id, driverId: drivers[3].id, origin: "Pune", destination: "Goa", cargoWeight: 21000, estimatedFuelCost: 8500, actualFuelCost: 0, distance: 450, revenue: 32000, status: "DRAFT", createdAt: new Date("2026-02-20") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[0].id, driverId: drivers[5].id, origin: "Delhi", destination: "Lucknow", cargoWeight: 19000, estimatedFuelCost: 7200, actualFuelCost: 6900, distance: 550, revenue: 30000, status: "COMPLETED", completedAt: new Date("2026-01-28"), createdAt: new Date("2026-01-26") },
        }),
        prisma.trip.create({
            data: { vehicleId: vehicles[1].id, driverId: drivers[1].id, origin: "Jaipur", destination: "Udaipur", cargoWeight: 15500, estimatedFuelCost: 6800, actualFuelCost: 6500, distance: 420, revenue: 27000, status: "COMPLETED", completedAt: new Date("2026-01-30"), createdAt: new Date("2026-01-28") },
        }),
    ]);

    // Create maintenance logs
    await Promise.all([
        prisma.maintenanceLog.create({
            data: { vehicleId: vehicles[3].id, serviceType: "Engine Repair", cost: 15000, date: new Date("2026-02-14"), notes: "Engine overheating issue - replaced coolant system", status: "IN_PROGRESS" },
        }),
        prisma.maintenanceLog.create({
            data: { vehicleId: vehicles[0].id, serviceType: "Oil Change", cost: 3500, date: new Date("2026-02-01"), notes: "Regular 10,000km oil change", status: "COMPLETED" },
        }),
        prisma.maintenanceLog.create({
            data: { vehicleId: vehicles[1].id, serviceType: "Brake Replacement", cost: 8500, date: new Date("2026-01-20"), notes: "Front and rear brake pads replaced", status: "COMPLETED" },
        }),
        prisma.maintenanceLog.create({
            data: { vehicleId: vehicles[5].id, serviceType: "Tire Rotation", cost: 4200, date: new Date("2026-02-10"), notes: "All 6 tires rotated and balanced", status: "COMPLETED" },
        }),
        prisma.maintenanceLog.create({
            data: { vehicleId: vehicles[2].id, serviceType: "AC Service", cost: 2800, date: new Date("2026-01-25"), notes: "AC compressor serviced and gas refilled", status: "COMPLETED" },
        }),
    ]);

    // Create fuel logs
    const completedTrips = trips.filter(t => t.status === "COMPLETED");
    await Promise.all(completedTrips.map((trip, i) =>
        prisma.fuelLog.create({
            data: {
                tripId: trip.id,
                vehicleId: trip.vehicleId,
                driverId: trip.driverId,
                liters: 40 + i * 10,
                cost: trip.actualFuelCost,
                distance: trip.distance,
                date: trip.completedAt || new Date(),
            },
        })
    ));

    // Create expenses
    await Promise.all(completedTrips.map((trip, i) =>
        prisma.expense.create({
            data: {
                tripId: trip.id,
                vehicleId: trip.vehicleId,
                driverId: trip.driverId,
                category: "FUEL",
                amount: trip.actualFuelCost,
                description: `Fuel for trip ${trip.origin} to ${trip.destination}`,
                date: trip.completedAt || new Date(),
            },
        })
    ));

    // Add some toll expenses
    await Promise.all([
        prisma.expense.create({
            data: { tripId: completedTrips[0].id, vehicleId: completedTrips[0].vehicleId, category: "TOLL", amount: 1200, description: "Highway toll charges", date: new Date("2026-02-10") },
        }),
        prisma.expense.create({
            data: { tripId: completedTrips[1].id, vehicleId: completedTrips[1].vehicleId, category: "TOLL", amount: 800, description: "Expressway toll", date: new Date("2026-02-12") },
        }),
        prisma.expense.create({
            data: { tripId: completedTrips[2].id, vehicleId: completedTrips[2].vehicleId, category: "TOLL", amount: 1500, description: "National highway toll", date: new Date("2026-02-14") },
        }),
    ]);

    console.log("✅ Database seeded successfully!");
    console.log(`   ${users.length} users`);
    console.log(`   ${vehicles.length} vehicles`);
    console.log(`   ${drivers.length} drivers`);
    console.log(`   ${trips.length} trips`);
    console.log(`   5 maintenance logs`);
    console.log(`   ${completedTrips.length} fuel logs`);
    console.log(`   ${completedTrips.length + 3} expenses`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
