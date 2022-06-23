const meta_kg = require("@biothings-explorer/smartapi-kg");
const snakeCase = require("snake-case");
const fs = require("fs");
var path = require('path');
const util = require('util');
const PredicatesLoadingError = require("../utils/errors/predicates_error");
const ids = require("./ids");
const readFile = util.promisify(fs.readFile);
const debug = require("debug")("bte:biothings-explorer-trapi:metakg");
const { API_LIST: apiList } = require("../config/apis");

module.exports = class MetaKnowledgeGraphHandler {
    constructor(smartAPIID = undefined, teamName = undefined) {
        this.smartAPIID = smartAPIID;
        this.teamName = teamName;
    }

    async _loadMetaKG(smartAPIID = undefined, teamName = undefined) {
        const smartapi_specs = path.resolve(__dirname, '../../data/smartapi_specs.json');
        const predicates = path.resolve(__dirname, '../../data/predicates.json');
        const kg = new meta_kg.default(smartapi_specs, predicates);
        try {
            if (smartAPIID !== undefined) {
                debug(`Constructing with SmartAPI ID ${smartAPIID}`)
                kg.constructMetaKGSync(false, { apiList, smartAPIID: smartAPIID })
            } else if (teamName !== undefined) {
                debug(`Constructing with team ${teamName}`)
                kg.constructMetaKGSync(false, { apiList, teamName: teamName })
            } else {
                debug(`Constructing with default`)
                kg.constructMetaKGSync(true, { apiList, })
            }
            if (kg.ops.length === 0) {
                debug(`Found 0 operations`)
                throw new PredicatesLoadingError("Not Found - 0 operations");
            }
            return kg;
        } catch (error) {
            debug(`ERROR getting graph with ID:${smartAPIID} team:${teamName} because ${error}`)
            throw new PredicatesLoadingError(`Failed to Load MetaKG: ${error}`);
        }

    }

    _modifyCategory(category) {
        if (category.startsWith("biolink:")) {
            return 'biolink:' + category.charAt(8).toUpperCase() + category.slice(9);
        } else {
            return "biolink:" + category.charAt(0).toUpperCase() + category.slice(1);
        }
    }

    _modifyPredicate(predicate) {
        if (predicate.startsWith("biolink:")) {
            return 'biolink:' + snakeCase.snakeCase(predicate.slice(8));
        } else {
            return "biolink:" + snakeCase.snakeCase(predicate);
        }
    }

    async getKG(smartAPIID = this.smartAPIID, teamName = this.teamName) {
        const kg = await this._loadMetaKG(smartAPIID, teamName);
        let knowledge_graph = {
            nodes: {},
            edges: []
        };
        let predicates = {};
        Object.keys(ids).map(semanticType => {
            knowledge_graph.nodes[this._modifyCategory(semanticType)] = {
                id_prefixes: ids[semanticType].id_ranks
            }
        })
        kg.ops.map(op => {
            let input = this._modifyCategory(op.association.input_type);
            let output = this._modifyCategory(op.association.output_type);
            let pred = this._modifyPredicate(op.association.predicate);
            if (!(input in predicates)) {
                predicates[input] = {};
            }
            if (!(output in predicates[input])) {
                predicates[input][output] = [];
            }
            if (!(predicates[input][output].includes(pred))) {
                predicates[input][output].push(pred);
            }
        })
        Object.keys(predicates).map(input => {
            Object.keys(predicates[input]).map(output => {
                predicates[input][output].map(pred => {
                    knowledge_graph.edges.push({
                        subject: input,
                        predicate: pred,
                        object: output
                    })
                })
            })
        })
        return knowledge_graph;
    }
}
