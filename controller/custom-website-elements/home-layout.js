const HomeLayout = require('./../../models/custom-website-elements/home-layout');
const logger = require('./../../logger');

// fetches only active layout 
async function fetch(req, res) {
    try {
        const activeLayout = await HomeLayout.findOne(
            { active: true }
        );

        res.status(200).json(activeLayout);
    }
    catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Unable to fetch Layout right now'
        });
    }
}

// For admins only
async function updateOrCreate(req, res) {
    try {
        const input = req.body;

        if(input.active){
            await HomeLayout.updateOne(
                {active: true},
                {
                    $set: {
                        active: false
                    }
                }
            );
        };

        if (input._id) {
            await HomeLayout.updateOne(
                { _id: input._id },
                {
                    $set: {
                        name: input.name,
                        layout: input.layout,
                        active: input.active
                    }
                }
            );
        }
        else {
            await HomeLayout.create({
                name: input.name,
                layout: input.layout,
                active: input.active
            });
        }

        res.status(200).json({
            message: 'Successfully update/created layout'
        });
    }
    catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Unable to update/create Layout right now'
        });
    }
}

async function fetchAll(req, res) {
    try {
        const layouts = await HomeLayout.find({});

        res.status(200).json(layouts);
    }
    catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Unable to fetch Layouts right now'
        });
    }
}

async function deleteLayout(req, res){
    try {
        const layoutId = req.body.id;
        const layout = await HomeLayout.findById(layoutId);
        if(layout.active){
            res.status(403).json({
                message: 'Cannot delete currently active Layout'
            });
            return;
        }

        await HomeLayout.deleteOne({_id: layoutId});
        res.status(202).json({});
    } 
    catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Unable to delete this Layout right now'
        });
    }
}

module.exports = {
    updateOrCreate,
    fetchAll,
    fetch,
    deleteLayout
}