"use client";
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar/Navbar';
import * as mysql from "mysql2/promise";
import { Characteristic, Drop, GroupedItems, GroupedMob, GroupedRecipes, Item, Jobs, MobDrop, Recipe } from '@/app/interfaces';
import { set } from 'zod';

const Page: React.FC = () => {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('id');
    const [item, setItem] = useState<GroupedItems[]>([]);
    const [recipes, setRecipes] = useState<GroupedRecipes[]>([]);
    const [job, setjob] = useState<String>('');
    const [mobs, setMobs] = useState<GroupedMob[]>([]);

    useEffect(() => {
        if (itemId) {
            fetchItem();
            fetchMobDrop();
        }
    }, [itemId]);   

    const router = useRouter();
    const redirectSet = (setId: string) => {
        router.push(`/set?id=${setId}`);
    }

    const fetchItem = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/items?id=${itemId}`);
            const recipesResponse = await axios.get(`http://localhost:3000/recipes?resultId=${itemId}`)
            let jobsResponse: Jobs | any;
            try {
                jobsResponse = await axios.get(`http://localhost:3000/jobs?id=${recipesResponse.data.data[0].jobId}`);
                setjob(jobsResponse.data.data[0].jobName);
            } catch (error) {
                console.error(error);
            }
            setRecipes(recipesResponse.data.data);
            setItem(response.data.data);
        } catch (error) {
            console.error(`Error fetching item ${error}`);
        }
    }

    const fetchMobDrop = async () => {
        try {
            const groupedMobs: GroupedMob[] = [];
            let filters = "";
            const dropsReponse = await axios.get(`http://localhost:3000/mobs-drop?dropId=${itemId}`);
            dropsReponse.data.data.forEach((drop: MobDrop) => {
                filters += `id=${drop.mobId}&`;
            });
            const mobResponse = await axios.get(`http://localhost:3000/mobs?${filters}`);
            setMobs(mobResponse.data.data);
        } catch (error) {
            console.error(`Error fetching mob drop ${error}`);
        }
    } 

    const redirectRecipeItem = async (id: number) => {
        router.push(`/items/item?id=${id}`)
    }

    
    return (
        <div className='bg-[#a7a18d] h-screen'>
        <Navbar pageName="Home"/>
        <div className='xl:flex flex-row gap-4 px-8 bg-[#a7a18d]'>
        <div className='mt-10 lg:w-full'>
        {item.map((item: GroupedItems, index: number) => (
                <div key={index} className="bg-[#c6bdab] text-black px-3 pb-2 rounded-sm border-[#3eb167] border">
                <div className="flex justify-between pt-3 pb-3 mb-4">
                  <div className="flex flex-col transition-all">
                    <h2 className="font-bold cursor-pointer hover:text-gray-300">{item.itemName}</h2>
                    <h3 className="text-sm text-gray-500">{item.type} - niveau {item.level}</h3>
                    <h3 className="text-sm mb-5 text-green-300 cursor-pointer hover:text-[#779643]" onClick={() => redirectSet(item.setID.toString())}>{item.setName}</h3>
                  </div>
                  <img src={item.imgHighRes} alt={item.itemName} draggable='false' className="p-2 rounded-sm size-32"/>
                </div>                  
                <h3 className="mb-6">{item.description}</h3>
                {item.characteristics.map((charac: Characteristic) => (
                <div>
                    {charac.characId < 0 && (
                        <div>
                            <div className="flex items-center text-sm">
                                <img src={charac.characImg} alt='x' className="mr-1 size-6" draggable='false'/>
                                <p>{charac.characFrom} à {charac.characTo} {charac.characName}</p>
                            </div>
                        </div>
                    )}
                </div>
             ))}
             {item.characteristics.map((charac: Characteristic, idx: number) => (
                                <div key={idx} className="flex items-center">
                                    {charac.characId >= 0 && (
                                            <p className={charac.characFrom < 0 || charac.characTo < 0 ? "text-red-500" : "text-sm"}> 
                                                {charac.characTo ? (
                                                    <>
                                                        <div className="flex items-center">
                                                            {charac.characFrom === null ? (
                                                                <div className="flex">
                                                                    <img src={charac.characImg} alt='x' className="mr-1 size-6" draggable='false'/>
                                                                    <p>{charac.characTo} {charac.characName}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="flex">
                                                                    {charac.effectId != 983 && (
                                                                        <div className="flex">
                                                                            <img src={charac.characImg} alt='x' className="mr-1 size-6" draggable='false'/>
                                                                            <p>{charac.characFrom} à {charac.characTo} {charac.characName}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                    {charac.effectId !== null && (
                                                        <div className="flex items-center">
                                                            {charac.effectId == 110 || charac.effectId == 139 ? (
                                                                <>
                                                                <div className="flex items-center text-sm">
                                                                    <p>rend {charac.characFrom} {charac.characName}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center text-sm">
                                                                    {charac.effectId == 795 ? (
                                                                        <p className=" text-orange-400">Arme de chasse</p>
                                                                    ) : (
                                                                        <div className="flex items-center text-sm">
                                                                            {charac.effectId != 984 && charac.effectId != 981 && (
                                                                                <div className="flex">
                                                                                    <img src={charac.characImg} alt='x' className="mr-1 size-6" draggable='false'/>
                                                                                    <p>{charac.characFrom} {charac.characName}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    </>
                                                )}
                                            </p>
                                    )}
                                </div>
                            ))}
                    {item.apCost && (
                        <>
                                <div className="text-sm  mt-3 pt-3 mb-1">
                                    <p className="flex"><p className="text-gray-500 mr-1">Coût </p>{item.apCost} PA</p>
                                    {item.minRange !== item.maxRange ? (
                                        <p className="flex"><p className="text-gray-500 mr-1">Portée </p>{item.minRange}-{item.maxRange}</p>
                                    ) : (
                                        <p className="flex"><p className="text-gray-500 mr-1">Portée </p>{item.maxRange}</p>
                                    )}
                                    <p className="flex"><p className="text-gray-500 mr-1">Utilisation par tour </p>{item.nmbCast}</p>
                                    <p className="flex"><p className="text-gray-500 mr-1">Critique </p>{item.criticalHitProbability}%</p>
                                </div>
                        </>
                    )}
                  </div>
              ))}
        </div>
            {recipes.map((recipe: GroupedRecipes) => (
                <div className='bg-[#cfc4ab] mt-3 lg:mt-10 h-fit pt-3 pr-10 border border-[#3eb167] pl-2'>
                    <div key={recipe.resultItemId}>
                        <p className='mb-2 font-bold'>{job}</p>
                        {recipe.recipe.map((item: Recipe, index: number) => (
                            <div key={index} className='flex flex-row items-center cursor-pointer hover:font-bold hover:bg-[#779643] pr-4 w-80' onClick={() => redirectRecipeItem(item.itemId)}>
                                <img src={item.itemImg} alt={item.itemName} className='size-11' draggable='false'/>
                                <p className='ml-2'>
                                    {item.quantity} {item.itemName}
                                </p>
                            </div>
                        ))}
                        <br></br>
                    </div>
                </div>
            ))}
            <div>
                {mobs.length > 0 && (
                    <div>
            <div className='flex flex-wrap border-[#3eb167] bg-[#796f5a] border mt-10 pt-2 pl-2'>
                {mobs.map((mob: GroupedMob) => (
                    <div className=' text-white h-fit w-fit text-sm mr-10'>
                        <div onClick={() => {router.push(`/mobs/mob?id=${mob.id}`)}} className='cursor-pointer'>
                            <p>{mob.name}</p>
                            <img src={mob.img} />
                        </div>    
                    </div>
                ))}
            </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    )
};

export default Page;