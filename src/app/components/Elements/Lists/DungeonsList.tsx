"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Frame from "../../ui/Frame";
import Image from "next/image";

interface Dungeon {
  name: string;
  lvl: string;
}

interface Achievement {
  AchievementId: number;
  AchievementName: string;
  AchievementDesc: string;
  AchievementLevel: number;
  AchievementImg: string;
}

export const DungeonsList: React.FC = () => {
  const [dungeons, setDungeons] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchDungeons = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/achievements?category=donjons"
        );
        setDungeons(response.data.data);
      } catch (error) {
        console.error("Error fetching dungeons list");
      }
    };
    fetchDungeons();
  }, []);

  const [hoveredDungeon, setHoveredDungeon] = useState<number | null>(null);

  const handleDungeonClick = (dungeonName: string) => {
    window.location.href = `${window.location.pathname}/${dungeonName}`;
  };

  return (
    <>
      <div className="px-4">
        <h1 className="text-white p-2">Liste des donjons</h1>
        <ul>
          <div className="grid grid-cols-5">
            {dungeons.map((achievement) => (
              <div
                key={achievement.AchievementId}
                onMouseEnter={() =>
                  setHoveredDungeon(achievement.AchievementId)
                }
                onMouseLeave={() => setHoveredDungeon(null)}
                onClick={() =>
                  handleDungeonClick(
                    achievement.AchievementName.replace("(Solo)", "")
                  )
                }
                className="hover:cursor-pointer w-fit"
              >
                <Frame width="12rem" height="5rem">
                  <Image
                    src={achievement.AchievementImg}
                    alt=""
                    width={64}
                    height={64}
                    className={`absolute z-0 mt-[1.2rem] ${
                      hoveredDungeon === achievement.AchievementId
                        ? "opacity-100"
                        : "opacity-35"
                    }`}
                  />
                  <h1 className="text-primary text-sm text-center mt-1 z-10">
                    {achievement.AchievementName.replace("(Solo)", "")}
                  </h1>
                  <h1 className="dark:text-blue text-xs text-center">
                    niv.{achievement.AchievementLevel}
                  </h1>
                </Frame>
              </div>
            ))}
          </div>
        </ul>
      </div>
    </>
  );
};