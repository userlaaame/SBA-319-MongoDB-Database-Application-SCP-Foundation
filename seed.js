//standalone script
//should be re-runnable: wipes collections first so the testing DELETE routes never
//leaves the DB under 5-document rubric
import mongoose from "mongoose";
import connectDB from "./db/conn.js";
import Scp from "./models/Scp.js";
import Personnel from "./models/Personnel.js";
import IncidentReport from "./models/IncidentReport.js";

// ----- test sample data -----

const scpData = [{
    itemNumber: 'SCP-002',
    title: 'The "Living" Room',
    objectClass: 'Euclid',
    series: 1,
    containmentProcedures:
        'SCP-002 is to remain connected to a suitable power supply at all times. Personnel entering must be accompanied by at least two Level-2 staff.',
    description:
        'SCP-002 resembles a tumorous, fleshy growth roughly 60 cubic meters in volume, with an interior resembling a low-rent apartment.',
    rating: 1200,
},
{
    itemNumber: 'SCP-096',
    title: 'The "Shy Guy"',
    objectClass: 'Euclid',
    series: 1,
    containmentProcedures:
        'SCP-096 is to be contained in a 5m x 5m x 5m airtight steel cube at all times. No video surveillance of its face is permitted.',
    description:
        'SCP-096 is a humanoid creature that enters a state of extreme distress when its face is viewed by any means.',
    rating: 3100,
},
{
    itemNumber: 'SCP-173',
    title: 'The Sculpture',
    objectClass: 'Euclid',
    series: 1,
    containmentProcedures:
        'SCP-173 is to be kept in a locked container at all times. Personnel entering must maintain direct eye contact until all have exited.',
    description:
        'SCP-173 is a concrete sculpture that cannot move while within a direct line of sight. It attacks when visual contact is broken.',
    rating: 5000,
},
{
    itemNumber: 'SCP-049',
    title: 'Plague Doctor',
    objectClass: 'Neutralized',
    series: 1,
    containmentProcedures:
        'SCP-049 is contained within a Standard Secure Humanoid Containment Cell in Research Sector-02 at Site-19. SCP-049 must be sedated before any attempts to transport it. During transport, SCP-049 must be secured within a Class III Humanoid Restriction Harness (including a locking collar and extension restraints) and monitored by no fewer than two armed guards.',
    description:
        `SCP-049 is a humanoid entity, roughly 1.9 meters in height, which bears the appearance of a medieval plague doctor. While SCP-049 appears to be wearing the thick robes and the ceramic mask indicative of that profession, the garments instead seem to have grown out of SCP-049's body over time1, and are now nearly indistinguishable from whatever form is beneath them. X-rays indicate that despite this, SCP-049 does have a humanoid skeletal structure beneath its outer layer.`,
    rating: 5612,
},
{
    itemNumber: 'SCP-055',
    title: 'Unknown',
    objectClass: 'Neutralized',
    series: 1,
    containmentProcedures:
        `Object is kept within a five (5) by five (5) by two point five (2.5) meter square room constructed of cement (fifty (50) centimeter thickness), with a Faraday cage surrounding the cement walls. Access is via a heavy containment door measuring two (2) by two point five (2.5) meters constructed on bearings to ensure door closes and locks automatically unless held open deliberately. Security guards are NOT to be posted outside SCP-055's room. It is further advised that all personnel maintaining or studying other SCP objects in the vicinity try to maintain a distance of at least fifty (50) meters from the geometric center of the room, as long as this is reasonably practical.`,
    description:
        `SCP-055's physical appearance is unknown. It is not indescribable, or invisible: individuals are perfectly capable of entering SCP-055's container and observing it, taking mental or written notes, making sketches, taking photographs, and even making audio/video recordings. An extensive log of such observations is on file. However, information about SCP-055's physical appearance "leaks" out of a human mind soon after such an observation. Individuals tasked with describing SCP-055 afterwards find their minds wandering and lose interest in the task; individuals tasked with sketching a copy of a photograph of SCP-055 are unable to remember what the photograph looks like, as are researchers overseeing these tests. Security personnel who have observed SCP-055 via closed-circuit television cameras emerge after a full shift exhausted and effectively amnesiac about the events of the previous hours.`,
    rating: 4699,
},
{
    itemNumber: 'SCP-087',
    title: 'The Stairwell',
    objectClass: 'Safe',
    series: 1,
    containmentProcedures:
        `SCP-087 is located on the campus of [REDACTED]. The doorway leading to SCP-087 is constructed of reinforced steel with an electro-release lock mechanism. It has been disguised to resemble a janitorial closet consistent with the design of the building. The lock mechanism on the doorknob will not release unless ██ volts are applied in conjunction with counter-clockwise rotation of the key. The inside of the door is lined with 6 centimeters of industrial foam padding.`,
    description:
        `SCP-087 is an unlit platform staircase. Stairs descend on a 38 degree angle for 13 steps before reaching a semicircular platform of approximately 3 meters in diameter. Descent direction rotates 180 degrees at each platform. The design of SCP-087 limits subjects to a visual range of approximately 1.5 flights. A light source is required for any subjects exploring SCP-087, as there are no lighting fixtures or windows present. Lighting sources brighter than 75 watts have shown to be ineffective, as SCP-087 seems to absorb excess light.`,
    rating: 3839,
},
{
    itemNumber: 'SCP-106',
    title: 'The Old Man',
    objectClass: 'Thaumiel',
    series: 1,
    containmentProcedures:
        `SCP-106 is to be contained in a sealed container, comprised of lead-lined steel. The container will be sealed within forty layers of identical material, each layer separated by no less than 36cm of empty space. Support struts between layers are to be randomly spaced. Container is to remain suspended no less than 60cm from any surface by ELO-IID electromagnetic supports.`,
    description:
        `SCP-106 appears to be an elderly humanoid, with a general appearance of advanced decomposition. This appearance may vary, but the “rotting” quality is observed in all forms. SCP-106 is not exceptionally agile, and will remain motionless for days at a time, waiting for prey. SCP-106 is also capable of scaling any vertical surface and can remain suspended upside down indefinitely. When attacking, SCP-106 will attempt to incapacitate prey by damaging major organs, muscle groups, or tendons, then pull disabled prey into its pocket dimension. SCP-106 appears to prefer human prey items in the 10-25 years of age bracket.`,
    rating: 3705,
},
{
    itemNumber: 'SCP-131',
    title: 'The Eye Pods',
    objectClass: 'Safe',
    series: 1,
    containmentProcedures:
        `No special safety procedures are to be taken with SCP-131-A and SCP-131-B. They are free to travel about Site-19 so long as they do not attempt to enter any restricted areas or attempt to leave the facility. Casual contact with the subjects is permitted, but it is recommended that such contact be kept to a minimum to prevent the creatures from forming an attachment to personnel. Hourly tabs are to be kept on subjects at all times; failure to account for their presence at these times constitutes a level one lockdown situation. Any report of abuse or mistreatment of the subjects will result in a harsh reprimand.`,
    description:
        `SCP-131-A and SCP-131-B (affectionately nicknamed the "Eye Pods" by personnel) are a pair of teardrop-shaped creatures roughly 30 cm (1 ft) in height, with a single blue eye in the middle of their bodies. SCP-131-A is burnt orange in color while SCP-131-B is mustard yellow. At the base of each creature is a wheel-like protrusion which allows for locomotion, suggesting that the creatures may be biomechanical in origin. The subjects can move surprisingly fast, covering over 60 m (200 ft) in a matter of seconds. The subjects, however, lack a braking system, which has led to some rather spectacular, if not overly amusing, mishaps involving the creatures. The subjects have also shown the ability to climb sheer surfaces, and have gotten lost in the air vents on more than one occasion.`,
    rating: 1314,
},
{
    itemNumber: 'SCP-426',
    title: 'I am a toaster',
    objectClass: 'Euclid',
    series: 1,
    containmentProcedures:
        `I am to be sealed in a chamber with no windows through which I may be viewed. The door to my chamber must have a label completely unrelated to my designation or identity, in order to prevent unintended spread of my primary effect. Only Level 3 and above personnel are to know of my presence, and particularly of my properties. Assigned personnel are to be rotated out on a monthly basis to prevent contamination by my secondary effect. Psychiatric evaluation is mandatory at the end of the month. If personnel are deemed unaffected, they may be re-assigned to me no less than four months after their last rotation with me. Any affected personnel are to be given a Class C amnestic and transferred to a different site.`,
    description:
        `Hello, I am SCP-426. I must be introduced this way in order to prevent ambiguity. I am an ordinary toaster, able to toast bread when supplied with electricity. However, when any human being mentions me, they inadvertently refer to me in the first person. Despite all attempts, there is yet to be a way to speak or write about me in the third person. When in my continuous presence for over two months, individuals begin to identify themselves as a toaster. Unless forcibly restrained, these people will ultimately harm themselves in their attempts to emulate my standard functions.`,
    rating: 3083,
},
{
    itemNumber: 'SCP-682',
    title: 'Hard-to-Destroy-Reptile',
    objectClass: 'Thaumiel',
    series: 1,
    containmentProcedures:
        `SCP-682 must be destroyed as soon as possible. At this time, no means available to SCP teams are capable of destroying SCP-682, only able to cause massive physical damage. SCP-682 should be contained within a 5 m x 5 m x 5 m chamber with 25 cm reinforced acid-resistant steel plate lining all inside surfaces. The containment chamber should be filled with hydrochloric acid until SCP-682 is submerged and incapacitated. Any attempts of SCP-682 to move, speak, or breach containment should be reacted to quickly and with full force as called for by the circumstances.`,
    description:
        ` SCP-682 is a large, vaguely reptile-like creature of unknown origin. It appears to be extremely intelligent, and was observed to engage in complex communication with SCP-079 during their limited time of exposure. SCP-682 appears to have a hatred of all life, which has been expressed in several interviews during containment. (See Addendum 682-B).`,
    rating: 4238,
},
];

const personnelData = [
    { name: 'Dr. Elara Voss', designation: 'Researcher', clearanceLevel: 4, site: 'Site-19' },
    { name: 'Agent Marcus Hale', designation: 'Agent', clearanceLevel: 3, site: 'Site-19' },
    { name: 'D-9341', designation: 'D-Class', clearanceLevel: 1, site: 'Site-19', active: false },
    // Site-17 — heavy humanoid containment, higher clearance concentration
    { name: 'Dr. Sophia Light', designation: 'Doctor', clearanceLevel: 5, site: 'Site-17' },
    { name: 'Dr. Nathaniel Crane', designation: 'Researcher', clearanceLevel: 4, site: 'Site-17' },
    { name: 'Agent Priya Raman', designation: 'Agent', clearanceLevel: 3, site: 'Site-17' },
    { name: 'Cpt. Lena Okafor', designation: 'MTF Operative', clearanceLevel: 4, site: 'Site-17' },
    { name: 'D-7112', designation: 'D-Class', clearanceLevel: 1, site: 'Site-17', active: false },
    // Site-64 — research-leaning roster, spread across clearance levels
    { name: 'Dr. Amara Okonkwo', designation: 'Doctor', clearanceLevel: 5, site: 'Site-64' },
    { name: 'Dr. Viktor Rurik', designation: 'Researcher', clearanceLevel: 3, site: 'Site-64' },
    { name: 'Agent Cole Whitaker', designation: 'Agent', clearanceLevel: 2, site: 'Site-64' },
    { name: 'Sgt. Isabel Moreno', designation: 'MTF Operative', clearanceLevel: 4, site: 'Site-64' },
    { name: 'Dr. Hana Sato', designation: 'Researcher', clearanceLevel: 4, site: 'Site-64' },
    { name: 'D-5580', designation: 'D-Class', clearanceLevel: 1, site: 'Site-64', active: false },
    { name: 'Agent Dmitri Volkov', designation: 'Agent', clearanceLevel: 2, site: 'Site-17' },
];

// ---- seed logic ----

const seed = async () => {
    await connectDB();

    //I'll try wiping in one round trip; order shouldn't matter for deletion
    await Promise.all([
        Scp.deleteMany({}),
        Personnel.deleteMany({}),
        IncidentReport.deleteMany({}),
    ]);
    console.log('Collections cleared');

    // Insert parents first-incidents need their generated_ids
    const scps = await Scp.insertMany(scpData);
    const personnel = await Personnel.insertMany(personnelData);

    //Readable lookups instead
    //I want every name and itemNumber to match an array, the declarations should help throw if a lookup misses
    //so the a typo kills the seed instead of inserting an orphan
    const scpId = (num) => scps.find((s) => s.itemNumber === num)._id;
    const personId = (name) => personnel.find((p) => p.name === name)._id;

    const incidentData = [
        {
            scp: scpId('SCP-173'),
            reportedBy: personId('Agent Marcus Hale'),
            severity: 'Containment Breach',
            summary: 'Blink synchronization failure during chamber cleaning. Two casualties before re-containment.',
            occurredAt: new Date('2026-05-14'),
            casualties: 2,
        },
        {
            scp: scpId('SCP-096'),
            reportedBy: personId('Dr. Elara Voss'),
            severity: 'Minor',
            summary: 'Audio distress event triggered by reflective surface left in chamber. No visual contact confirmed.',
            occurredAt: new Date('2026-06-02'),
            casualties: 0,
        },
        {
            scp: scpId('SCP-002'),
            reportedBy: personId('D-9341'),
            severity: 'Moderate',
            summary: 'Power fluctuation caused temporary dormancy failure. One D-Class unaccounted for.',
            occurredAt: new Date('2026-06-21'),
            casualties: 1,
        },
        // ---- SCP-682 cluster: high-severity, high-casualty (the breach magnet) ----
    {
      scp: scpId('SCP-682'),
      reportedBy: personId('Sgt. Isabel Moreno'),
      severity: 'Containment Breach',
      summary: 'Acid tank drainage malfunction allowed partial regeneration. Subject breached inner chamber before re-submersion. Four casualties.',
      occurredAt: new Date('2025-11-03'),
      casualties: 4,
    },
    {
      scp: scpId('SCP-682'),
      reportedBy: personId('Dr. Amara Okonkwo'),
      severity: 'Severe',
      summary: 'Termination attempt via chemical exposure failed. Subject adapted within 90 seconds. No casualties, extensive chamber damage.',
      occurredAt: new Date('2026-01-19'),
      casualties: 0,
    },
    {
      scp: scpId('SCP-682'),
      reportedBy: personId('Cpt. Lena Okafor'),
      severity: 'Containment Breach',
      summary: 'Subject regenerated during scheduled transfer and breached restraint harness. Re-contained after MTF intervention. Three casualties.',
      occurredAt: new Date('2026-03-27'),
      casualties: 3,
    },
    {
      scp: scpId('SCP-682'),
      reportedBy: personId('Dr. Viktor Rurik'),
      severity: 'Minor',
      summary: 'Subject issued verbal threats during interview, expressing hatred of all life. No physical breach attempt. Interview terminated early.',
      occurredAt: new Date('2026-06-30'),
      casualties: 0,
    },

    // ---- SCP-173 cluster: blink-failure breaches ----
    {
      scp: scpId('SCP-173'),
      reportedBy: personId('D-7112'),
      severity: 'Severe',
      summary: 'Chamber lighting failure broke line of sight during feeding. Subject relocated 4 meters. One casualty before lights restored.',
      occurredAt: new Date('2025-12-08'),
      casualties: 1,
    },
    {
      scp: scpId('SCP-173'),
      reportedBy: personId('Agent Priya Raman'),
      severity: 'Minor',
      summary: 'Maintenance crew maintained staggered eye contact per protocol. No movement recorded. Logged as successful containment drill.',
      occurredAt: new Date('2026-02-16'),
      casualties: 0,
    },

    // ---- SCP-106 cluster: pocket-dimension events ----
    {
      scp: scpId('SCP-106'),
      reportedBy: personId('Dr. Sophia Light'),
      severity: 'Containment Breach',
      summary: 'Subject emerged from containment via wall corrosion and pulled one D-Class into pocket dimension. Subject lured back with prey protocol.',
      occurredAt: new Date('2026-01-05'),
      casualties: 1,
    },
    {
      scp: scpId('SCP-106'),
      reportedBy: personId('Sgt. Isabel Moreno'),
      severity: 'Moderate',
      summary: 'Corrosion detected on outer containment layer during inspection. Recontainment protocol executed before full breach. No casualties.',
      occurredAt: new Date('2026-04-22'),
      casualties: 0,
    },

    // ---- SCP-096 (second event; pairs with existing Minor one) ----
    {
      scp: scpId('SCP-096'),
      reportedBy: personId('Dr. Nathaniel Crane'),
      severity: 'Severe',
      summary: 'Photograph of subject face inadvertently displayed on monitor. Subject entered pursuit state. Viewing individual deceased before lockdown.',
      occurredAt: new Date('2026-03-11'),
      casualties: 1,
    },

    // ---- singletons: variety across the enum ----
    {
      scp: scpId('SCP-049'),
      reportedBy: personId('Dr. Hana Sato'),
      severity: 'Moderate',
      summary: 'Subject attempted "cure" procedure on assigned D-Class during interview. Subject sedated. D-Class deceased from the procedure.',
      occurredAt: new Date('2026-02-28'),
      casualties: 1,
    },
    {
      scp: scpId('SCP-087'),
      reportedBy: personId('Agent Cole Whitaker'),
      severity: 'Minor',
      summary: 'Exploration team descended 8 platforms before losing audio contact. Team recalled per protocol. All personnel recovered unharmed.',
      occurredAt: new Date('2026-04-09'),
      casualties: 0,
    },
    {
      scp: scpId('SCP-426'),
      reportedBy: personId('Dr. Amara Okonkwo'),
      severity: 'Minor',
      summary: 'Assigned researcher exceeded rotation window and began identifying as a toaster. Administered Class C amnestic. Reassignment pending.',
      occurredAt: new Date('2026-05-30'),
      casualties: 0,
    },
    ];


    await IncidentReport.insertMany(incidentData);

    //----verify data operation ----
    const [scpCount, personnelCount, incidentCount] = await Promise.all([
        Scp.countDocuments(),
        Personnel.countDocuments(),
        IncidentReport.countDocuments(),
    ]);
    console.log(`Seeded: ${scpCount} SCPs, ${personnelCount} personnel, ${incidentCount} incidents`);

    await mongoose.connection.close(); // otherwise the script hangs — open
    // sockets keep the Node process alive
};

seed().catch(async (err) => {
    console.error('Seed failed:', err.message);
    await mongoose.connection.close();
    process.exit(1);
});